import { createElement, ensureElement } from '../../utils/utils';
import { Component } from '../Component';
import { IEvents } from '../base/events';

interface IBasketView {
	productItems: HTMLElement[];
	totalPriceNumber: number;
}

// Отвечает за отображение и взаимодействие с элементами корзины
export class BasketView extends Component<IBasketView> {
	protected _basketList: HTMLElement;
	protected _basketOrderButton: HTMLButtonElement;
	protected _totalPriceBasket: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._basketList = ensureElement<HTMLElement>(
			`.basket__list`,
			this.container
		);
		this._basketOrderButton = ensureElement<HTMLButtonElement>(
			`.button`,
			this.container
		);
		this._totalPriceBasket = ensureElement<HTMLElement>(
			`.basket__price`,
			this.container
		);

		this._basketOrderButton.addEventListener('click', () => {
			events.emit('orderInBasket:opened');
		});
		this.productItems = [];
	}

	// Устанавливает список продуктов в корзине, обновляет список товаров и отображает их количество
	set productItems(products: HTMLElement[]) {
		if (products.length > 0) {
			products.forEach((item, index) => {
				const itemIndex: HTMLElement = item.querySelector(
					'.basket__item-index'
				);
				if (itemIndex) {
					this.setText(itemIndex, (index + 1).toString());
				}
			});

			this._basketList.replaceChildren(...products);
			this.setVisible(this._totalPriceBasket);
			this.setDisabled(this._basketOrderButton, false);
		} else {
			this._basketList.replaceChildren(
				createElement<HTMLElement>('p', {
					textContent: 'Добавьте товар в корзину',
				})
			);
			this.setHidden(this._totalPriceBasket);
			this.setDisabled(this._basketOrderButton, true);
		}
	}

	// Устанавливает итоговую сумму в корзине и отображает количество синапсов
	set totalPriceNumber(amount: number) {
		if (amount === 0) {
			this.setText(this._totalPriceBasket, 'Бесценный товар нельзя купить!');
			this.setDisabled(this._basketOrderButton, true);
		} else {
			this.setText(this._totalPriceBasket, `${amount} синапсов`);
		}
	}
}
