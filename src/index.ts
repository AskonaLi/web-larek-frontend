import './scss/styles.scss';
import { AppApi } from './components/AppApi';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { cloneTemplate, ensureElement } from './utils/utils';
import { MainPageView } from './components/view/MainPageView';
import { Catalog, Basket, ContactsOrder } from './components/AppData';
import { Modal } from './components/view/Modal';
import { BasketView } from './components/view/BasketView';
import { ICatalogEventData, OrderForm, IProductItem } from './types';
import { CardPreview, CardView } from './components/view/CardView';
import {
	PayOrderFormView,
	ContactsView,
	PlacedOrderView,
} from './components/Order';

const api = new AppApi(CDN_URL, API_URL);
const events = new EventEmitter();

// Все темплейты
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const BasketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Глобальные контейнеры
const page = new MainPageView(document.body, events);
const catalog = new Catalog(events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

// Переиспользуемые части интерфейса
const basketObject = new Basket(events);
const basketView = new BasketView(cloneTemplate(BasketTemplate), events);
const orderObject = new ContactsOrder(events);
const orderPayView = new PayOrderFormView(cloneTemplate(orderTemplate), events);
const orderContactsView = new ContactsView(
	cloneTemplate(contactsTemplate),
	events
);
const orderPlacedView = new PlacedOrderView(cloneTemplate(successTemplate), {
	onClick: () => modal.close(),
});

// Получает данные о товарах с сервера
const productsApi = async () => {
	try {
		const data = await api.getProductList();
		catalog.setCatalog(data);
	} catch (error) {
		console.log(`Произошла ошибка: ${error}`);
	}
};

productsApi();

//Открывает превью с товаром
events.on('product:open', (productItem: IProductItem) => {
	const cardPreview = new CardPreview(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			productItem.isAddedToBasket = !productItem.isAddedToBasket;
			if (productItem.isAddedToBasket) {
				events.emit('product:addToBasket', productItem);
			} else {
				events.emit('product:removeFromBasket', productItem);
			}
		},
	});
	const cardPreviewRender = {
		content: cardPreview.render({
			id: productItem.id,
			description: productItem.description,
			image: productItem.image,
			title: productItem.title,
			category: productItem.category,
			price: productItem.price,
			isAddedToBasket: productItem.isAddedToBasket,
		}),
	};
	modal.render(cardPreviewRender);
});

//Добавляет товар в корзину
events.on('product:addToBasket', (product: IProductItem) => {
	basketObject.addBasketOrder(product);
	modal.close();
});

//Удаляет товар из корзины
events.on('product:removeFromBasket', (product: IProductItem) => {
	basketObject.deleteBasketOrder(product);
});

//Обновляет корзину и счетчик
events.on('basket:changed', (productsInBasket: IProductItem[]) => {
	page.basketCountNumber = productsInBasket.length;
});

//Открывет корзину
events.on('basket:opened', () => {
	const basketListItems = basketObject.getBasketOrders().basket;
	const cardsInBasketTemplates = basketListItems.map((item) => {
		const cardInBasket = new CardView(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				item.isAddedToBasket = !item.isAddedToBasket;
				events.emit('product:removeFromBasket', item);
				events.emit('basket:opened');
			},
		});
		return cardInBasket.render({
			id: item.id,
			title: item.title,
			price: item.price,
		});
	});
	modal.render({
		content: basketView.render({
			productItems: cardsInBasketTemplates,
			totalPriceNumber: basketObject.getTotalPrice(),
		}),
	});
});

// Инициализирует заказ при нажатии на кнопку в корзине
events.on('orderInBasket:opened', () => {
	orderObject.items = basketObject.getBasketOrdersId();
	orderObject.total = basketObject.getTotalPrice();
	modal.render({
		content: orderPayView.render({
			address: '',
			payment: '',
			valid: false,
			errors: [],
		}),
	});
});

// Форма для ввода данных о оплате и адресе доставки
events.on(
	'deliveryOrder:change',
	(data: { field: keyof OrderForm; value: OrderForm[keyof OrderForm] }) => {
		orderObject.setPayNDeliever(data.field, data.value);
	}
);

events.on('formErrors.delivery:changed', (errors: Partial<OrderForm>) => {
	const deliveryItems = errors;
	orderPayView.valid = !deliveryItems.address && !deliveryItems.payment;
	orderPayView.errors = Object.values(deliveryItems)
		.filter((i) => !!i)
		.join('; ');
});

// Форма для ввода Email и номера телефона
events.on('deliveryOrder:nextForm', () => {
	modal.render({
		content: orderContactsView.render({
			phone: '',
			email: '',
			valid: false,
			errors: [],
		}),
	});
});

events.on('formErrors.contacts:changed', (errors: Partial<OrderForm>) => {
	const contactsItems = errors;
	orderContactsView.valid = !contactsItems.email && !contactsItems.phone;
	orderContactsView.errors = Object.values(contactsItems)
		.filter((i) => !!i)
		.join('; ');
});

events.on(
	'contactsOrder:change',
	(data: { field: keyof OrderForm; value: OrderForm[keyof OrderForm] }) => {
		orderObject.setContacts(data.field, data.value);
	}
);

// Управляет процессом оформления заказа, отправкой данных на сервер и отображением информации о завершении заказа.
events.on('deliveryContacts:nextPayment', () => {
	const orderInfo = orderObject._order;
	const unpricedItems = orderObject.items.filter(
		(item) => item !== 'b06cde61-912f-4663-9751-09956c0eed67'
	);

	api
		.sendOrderData({
			payment: orderInfo.payment,
			address: orderInfo.address,
			email: orderInfo.email,
			phone: orderInfo.phone,
			total: orderObject.total,
			items: unpricedItems,
		})
		.then((data) => {
			basketObject.clearBasket();
			modal.render({
				content: orderPlacedView.render({
					id: data.id,
					total: data.total,
				}),
			});
			page.basketCountNumber = 0;
			productsApi();
		})
		.catch((error) => {
			console.log(error);
		});
});

//Обновляет каталог
events.on('catalog:updated', (data: ICatalogEventData) => {
	const catalog = data.catalog.map((item) => {
		const cardCatalog = new CardView(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('product:open', item),
		});
		return cardCatalog.render({
			id: item.id,
			title: item.title,
			price: item.price,
			image: item.image,
			category: item.category,
		});
	});
	page.catalog = catalog;
});

// Блокирует/разблокирует контейнер страницы
events.on('modal:open', () => {
	page.wrapperLock = true;
});

events.on('modal:close', () => {
	page.wrapperLock = false;
});
