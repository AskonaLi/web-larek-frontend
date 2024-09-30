// Интерфейс товара
interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number;
}

// Интерфейс массива с товарами
interface IProductList {
  productItems: IProduct[];
}

// Интерфейс формы способа оплаты
interface IOrderFormPayment {
  payment: string;
  deliveryAddress: string;
}

// Интерфейс формы контактных данных
interface IOrderFormContacts {
  phoneNumber: number;
  email: string;
}

// Интерфейс успешной отправки заказа
interface ISucessOrder {
  id: string;
  total: number;
}

// Интерфейс корзины
interface IBasket {
  orders: BasketProductItem[];
  totalValue: number;
}

// Тип товара в корзине
type BasketProductItem = Pick<IProduct, 'id' | 'title' | 'price'>;

// Тип товара во всплывающем окне выбранного товара
type PopupProduct = Pick<IProduct, 'category' | 'title' | 'description' | 'price'>;

