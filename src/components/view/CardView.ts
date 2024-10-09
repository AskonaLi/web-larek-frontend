import { IProductItem } from '../../types';
import { ensureElement } from '../../utils/utils';
import { Component } from '../Component';

interface IActions {
	onClick: (event: MouseEvent) => void;
}

// Класс для отображения и взаимодействия с элементами карточки
export class CardView extends Component<IProductItem> {
	protected _categoryCardElement?: HTMLElement;
	protected _titleCardElement: HTMLElement;
	protected _imageCardElement?: HTMLImageElement;
	protected _priceCardElement: HTMLElement;
	protected _buttonCardElement?: HTMLButtonElement;
	protected _categoryTypes? = <Record<string, string>>{
		'софт-скил': 'soft',
		'хард-скил': 'hard',
		другое: 'other',
		дополнительное: 'additional',
		кнопка: 'button',
	};

	constructor(container: HTMLElement, actions?: IActions) {
		super(container);

		this._categoryCardElement = container.querySelector('.card__category');
		this._imageCardElement = container.querySelector('.card__image');
		this._buttonCardElement = container.querySelector('.card__button');
		this._titleCardElement = ensureElement<HTMLElement>(
			`.card__title`,
			container
		);

		this._priceCardElement = ensureElement<HTMLElement>(
			`.card__price`,
			container
		);

		if (actions?.onClick) {
			if (this._buttonCardElement) {
				this._buttonCardElement.addEventListener('click', actions.onClick);
			} else {
				this.container.addEventListener('click', actions.onClick);
			}
		}
	}

	// Устанавливает картегорию товара
	set category(value: string) {
		this.setText(this._categoryCardElement, value);
		this._categoryCardElement.className = `card__category card__category_${this._categoryTypes[value]}`;
	}

	// Размещает контент для загололовка товара
	set title(value: string) {
		this.setText(this._titleCardElement, value);
	}

	// Размещает изображение товара
	set image(value: string) {
		this.setImage(this._imageCardElement, value, this.title);
	}

	// Устанавливает стоимость товара
	set price(value: string | number) {
		if (value === null) {
			this.setText(this._priceCardElement, `Бесценно`);
		} else {
			this.setText(this._priceCardElement, `${value} синапсов`);
		}
	}
}

// Класс для предпросмотра карточки товара
export class CardPreview extends CardView {
	private _cardPreviewDescription: HTMLElement;
	private _buttonCardPreviwElement: HTMLButtonElement;
	private _isAddedToBasket: boolean;

	constructor(container: HTMLElement, actions?: IActions) {
		super(container, actions);

		this._cardPreviewDescription = ensureElement<HTMLElement>(
			`.card__text`,
			container
		);
		this._buttonCardPreviwElement = ensureElement<HTMLButtonElement>(
			`.card__button`,
			container
		);

		if (this._buttonCardPreviwElement) {
			this._buttonCardPreviwElement.addEventListener('click', () => {
				this.isAddedToBasket = !this.isAddedToBasket;
			});
		}

		if (actions?.onClick) {
			if (this._buttonCardPreviwElement) {
				container.removeEventListener('click', actions.onClick);
				this._buttonCardPreviwElement.addEventListener(
					'click',
					actions.onClick
				);
			}
		}
	}

	// Устанавливает описание товара
	set description(value: string) {
		this.setText(this._cardPreviewDescription, value);
	}

	// Меняет текст кнопки в зависимости от статуса добавления товара в корзину
	setButtonStatus(status: boolean) {
		if (status) {
			this.setText(this._buttonCardPreviwElement, 'Убрать из корзины');
		} else {
			this.setText(this._buttonCardPreviwElement, 'В корзину');
		}
	}

	// Возвращает текущее состояние добавления товара в корзину
	get isAddedToBasket(): boolean {
		return this._isAddedToBasket;
	}

	// Меняет состояние добавления товара в корзину и соответствующим образом меняет текст кнопки
	set isAddedToBasket(value: boolean) {
		this.setButtonStatus(value);
		this._isAddedToBasket = value;
	}

	// Основной метод рендеринга карточки товара
	render(data: IProductItem): HTMLElement {
		super.render(data);
		return this.container;
	}
}
