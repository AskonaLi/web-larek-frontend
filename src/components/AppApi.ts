import { Api, ApiListResponse } from './base/api';
import { IProductItem, IOrder, ISucessOrder } from '../types';

// Класс для взаимодействия с бэкендом сервиса
export class AppApi extends Api {
	cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	// Получает массив товаров с сервера
	getProductList(): Promise<IProductItem[]> {
		return this.get('/product').then((data: ApiListResponse<IProductItem>) => {
			return data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}));
		});
	}

	// Получает данные о товаре с сервера
	getProductItem(productId: string): Promise<IProductItem> {
		return this.get(`/product/${productId}`).then((item: IProductItem) => ({
			...item,
			image: this.cdn + item.image,
		}));
	}

	// Отправляет данные о заказанных товарах, контактных данных, и способе оплаты
	sendOrderData(order: IOrder): Promise<ISucessOrder> {
		return this.post('/order', order).then((data: ISucessOrder) => data);
	}
}
