// Интерфейс товара
export interface IProductItem {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	isAddedToBasket?: boolean;
}

// Тип товара в корзине
export type BasketProductItems = Pick<
	IProductItem,
	'id' | 'title' | 'price' | 'isAddedToBasket'
>;

// Интерфейс для массива товаров, передаваемых корзиной вместе с событием
export interface IBasketEventData {
	basket: BasketProductItems[];
}

// Интерфейс массива с товарами
export interface IProductList {
	productItems: IProductItem[];
}

// Тип для формы заказа
export type OrderForm = Partial<IOrderFormContacts> &
	Partial<IOrderFormPayment>;

// Интерфейс формы способа оплаты
export interface IOrderFormPayment {
	payment: string;
	address: string;
}

// Интерфейс формы контактных данных
export interface IOrderFormContacts {
	email: string;
	phone: string;
}

// Интерфейс объекта, содержащий общую информацию о заказе а также список выбранных товаров в виде идентификаторов.
export interface IOrder extends OrderForm {
	total: number;
	items: string[];
}

// Тип оплаты, который будет использоваться
export type PayMethod = 'card' | 'cash' | '';

// Тип для ошибок валидации
export type FormValidationErrors = Partial<Record<keyof IOrder, string>>;

// Интерфейс данных для отображения в окне после успешной оплаты заказа
export interface ISucessOrder {
	id: string;
	total: number | string;
}

// Интерфейс для возможных события, которые могут произойти в окне успешного заказа
export interface IOrderSuccessActions {
	onClick: () => void;
}

// Интерфейс передачи данных о каталоге при событии
export interface ICatalogEventData {
	catalog: IProductItem[];
}
