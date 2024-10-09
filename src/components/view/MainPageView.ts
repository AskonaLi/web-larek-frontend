import { Component } from '../Component';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';

interface IPage {
	catalog: HTMLElement[];
}

// Класс для отображения элементов на главной странице
export class MainPageView extends Component<IPage> {
	protected _wrapper: HTMLElement;
	protected _basketButton: HTMLButtonElement;
	protected _basketCounter: HTMLElement;
	protected _catalogElement: HTMLElement;

	constructor(container: HTMLElement, protected _events: IEvents) {
		super(container);

		this._wrapper = ensureElement<HTMLElement>(
			`.page__wrapper`,
			this.container
		);
		this._basketButton = ensureElement<HTMLButtonElement>(
			`.header__basket`,
			this.container
		);
		this._basketCounter = ensureElement<HTMLElement>(
			`.header__basket-counter`,
			this.container
		);
		this._catalogElement = ensureElement<HTMLElement>(
			`.gallery`,
			this.container
		);

		this._basketButton.addEventListener('click', () => {
			this._events.emit('basket:opened');
		});
	}

	// Устанавливает каталог товаров
	set catalog(productList: HTMLElement[]) {
		this._catalogElement.replaceChildren(...productList);
	}

	// Устанавливает количество товаров в корзине
	set basketCountNumber(value: number) {
		this.setText(this._basketCounter, value);
	}

	// Отвечает за блокировку/разблокировку контейнера страницы
	set wrapperLock(value: boolean) {
		if (value) {
			this._wrapper.classList.add('page__wrapper_locked');
		} else {
			this._wrapper.classList.remove('page__wrapper_locked');
		}
	}
}
