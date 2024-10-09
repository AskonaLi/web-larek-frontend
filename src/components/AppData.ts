import {
	IBasketEventData,
	OrderForm,
	IProductItem,
	BasketProductItems,
	FormValidationErrors,
	PayMethod,
} from '../types';
import { IEvents } from './base/events';
import { Model } from './Model';

// Класс, который хранит в себе данные о товаре
export class ProductItem extends Model<IProductItem> {
	constructor(data: IProductItem, events: IEvents) {
		super(data, events);
	}
}

// Класс для работы с каталогом товаров
export class Catalog extends Model<IProductItem[]> {
	protected _catalogList: IProductItem[];

	constructor(events?: IEvents | undefined) {
		super([], events);
	}

	// Устанавливает данные о каталоге товаров, отправляет событие об изменении данных в каталоге
	setCatalog(catalog: IProductItem[]) {
		this._catalogList = catalog.map((item) => ({
			...item,
			isAddedToBasket: false,
		}));
		this.emitChanges('catalog:updated', { catalog: this._catalogList });
	}
	// Получает обновленные данные о каталоге товаров
	getCatalog() {
		return this._catalogList;
	}
}

// Класс для работы с корзиной
export class Basket extends Model<BasketProductItems[]> {
	protected _productItemList: BasketProductItems[] = [];

	constructor(events?: IEvents) {
		super([], events);
	}

	// Вызывается при изменении данных в корзине
	changeBasketOrders() {
		this.events.emit('basket:changed', this._productItemList);
	}

	// Добавляет товар в корзину
	addBasketOrder(product: IProductItem) {
		const isProductInArray = this._productItemList.findIndex(
			(item) => item.id === product.id
		);
		if (isProductInArray === -1) {
			this._productItemList.push(product);
		}
		this.changeBasketOrders();
	}

	// Удаляет товар их корзины
	deleteBasketOrder(product: IProductItem) {
		this._productItemList = this._productItemList.filter((item) => {
			return item.id !== product.id;
		});
		this.changeBasketOrders();
	}

	// Очищает корзину
	clearBasket() {
		this._productItemList = [];
	}

	// Рассчитывает общую стоимость товаров в корзине
	getTotalPrice() {
		let totalPriceCounter = 0;
		this._productItemList.forEach((item) => {
			totalPriceCounter += item.price ?? 0;
		});
		return totalPriceCounter;
	}

	// Возвращает массив идентификаторов товаров для передачи на сервер
	getBasketOrdersId() {
		const arrWithIds: string[] = [];
		this._productItemList.forEach((item) => {
			arrWithIds.push(item.id);
		});
		return arrWithIds;
	}

	// Оформляет заказ нажатием на кнопку "Оформить". Генерирует событие оформления заказа
	placeAnOrder() {
		if (this._productItemList.length > 0) {
			this.emitChanges('basket:makeOrder');
		}
	}

	// Получает список товаров и генерирует событие, сигнализирующее об изменении в корзине
	getBasketOrders(): IBasketEventData {
		return {
			basket: this._productItemList,
		};
	}
}

// Класс для работы с формами заказа
export class ContactsOrder extends Model<OrderForm> {
	_order: OrderForm = {
		address: '',
		payment: '',
		email: '',
		phone: '',
	};
	total?: number;
	items?: string[];

	_formErrors: FormValidationErrors = {};

	constructor(events?: IEvents) {
		super({}, events);
	}

	// Устанавливает значения для полей способов оплаты и адреса доставки. Проводит валидацию данных
	setPayNDeliever(
		setField: keyof OrderForm,
		value: OrderForm[keyof OrderForm]
	) {
		if (setField === 'payment') {
			this._order[setField] = value as PayMethod;
		}
		if (setField === 'address') {
			this._order[setField] = value;
		}
		if (this.validationDelivery()) {
			this.events.emit('order.delivery:ok', this._order);
		}
	}

	// Метод валидации данных доставки и оплаты
	validationDelivery() {
		const errors: typeof this._formErrors = {};
		if (!this._order.address) {
			errors.address = 'Введите адрес доставки';
		}
		if (!this._order.payment) {
			errors.payment = 'Укажите способ оплаты';
		}
		this._formErrors = errors;
		this.events.emit('formErrors.delivery:changed', this._formErrors);
		return Object.keys(errors).length === 0;
	}

	// Задает значения для полей email и телефона. Валидирует данные
	setContacts(setField: keyof OrderForm, value: OrderForm[keyof OrderForm]) {
		if (setField === 'email') {
			this._order[setField] = value;
		}
		if (setField === 'phone') {
			this._order[setField] = value;
		}
		if (this.validationContacts()) {
			this.events.emit('order.contacts:ok', this._order);
		}
	}

	// Метод валидации контактных данных
	validationContacts() {
		const errors: typeof this._formErrors = {};
		if (!this._order.email) {
			errors.email = 'Введите вашу электронную почту';
		}
		if (!this._order.phone) {
			errors.phone = 'Введите ваш номер телефона';
		}
		this._formErrors = errors;
		this.events.emit('formErrors.contacts:changed', this._formErrors);
		return Object.keys(errors).length === 0;
	}
}
