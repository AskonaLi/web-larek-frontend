import {
	IOrderFormContacts,
	IOrderFormPayment,
	IOrderSuccessActions,
	PayMethod,
	ISucessOrder,
} from '../types';
import { Component } from '../components/Component';
import { ensureAllElements, ensureElement } from '../utils/utils';
import { IEvents } from './base/events';
import { Form } from './view/Form';

// Класс для модального окна формы заполнения данных доставки и оплаты.
export class PayOrderFormView extends Form<IOrderFormPayment> {
	protected paymentButtons: HTMLButtonElement[];

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._submit.addEventListener('click', () => {
			this.events.emit(`deliveryOrder:nextForm`);
		});
		this.paymentButtons = ensureAllElements('.button_alt', container);

		this.paymentButtons.forEach((button) => {
			button.addEventListener('click', (event) => {
				this.resetButtons();
				this.toggleClass(button, 'button_alt-active', true);
				this.selectPaymentMethod(
					(event.target as HTMLButtonElement).name as PayMethod
				);
			});
		});
	}

	// Сбрасывает состояние активной кнопки
	resetButtons() {
		if (this.paymentButtons) {
			this.paymentButtons.forEach((item) => {
				this.toggleClass(item, 'button_alt-active', false);
			});
		}
	}

	// Отвечает за выбор адреса доставки
	set deliveryAdress(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

	// Отвечает за выбор способа оплаты
	selectPaymentMethod(method: PayMethod) {
		this.events.emit('deliveryOrder:change', {
			field: 'payment',
			value: method,
		});
	}

	// Обрабатывает изменения в полях формы
	protected onInputChange(field: keyof IOrderFormPayment, value: string): void {
		this.events.emit('deliveryOrder:change', {
			field,
			value,
		});
	}
}

// Класс для ввода контактных данных при оформлении заказа
export class ContactsView extends Form<IOrderFormContacts> {
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._submit.addEventListener('click', () => {
			this.events.emit('deliveryContacts:nextPayment');
		});
	}

	// Отвечает за выбор электронной почты
	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}

	// Отвечает за выбор номера телефона
	set phoneNumber(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}

	// Обрабатывает изменения в полях формы
	protected onInputChange(
		field: keyof IOrderFormContacts,
		value: string
	): void {
		this.events.emit('contactsOrder:change', {
			field,
			value,
		});
	}
}

// Класс окна успешного заказа
export class PlacedOrderView extends Component<ISucessOrder> {
	_totalPrice: HTMLElement;
	_newBuying: HTMLElement;

	constructor(container: HTMLElement, actions: IOrderSuccessActions) {
		super(container);

		this._totalPrice = ensureElement<HTMLElement>(
			`.order-success__description`,
			this.container
		);
		this._newBuying = ensureElement<HTMLElement>(
			'.order-success__close',
			this.container
		);

		if (actions?.onClick) {
			this._newBuying.addEventListener('click', actions.onClick);
		}
	}

	// Устанавливает итоговую стоимость товара
	set total(value: number) {
		this.setText(this._totalPrice, `Списано ${value} синапсов`);
	}

	// Устанавливает уникальный идентификатор заказа
	set id(value: string) {
		this.container.dataset.id = value;
	}
}
