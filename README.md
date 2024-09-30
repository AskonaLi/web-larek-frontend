# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные и типы данных, используемые в приложении

Интерфейс товара
```
interface IProductItem {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number;
}
```

Интерфейс массива с товарами
```
interface IProductList {
  productItems: IProduct[];
}
```

Интерфейс формы способа оплаты
```
interface IOrderFormPayment {
  payment: string;
  deliveryAddress: string;
}
```

Интерфейс формы контактных данных
```
interface IOrderFormContacts {
  phoneNumber: number;
  email: string;
}
```

Интерфейс успешной отправки заказа
```
interface ISucessOrder {
  id: string;
  total: number;
}
```

Интерфейс корзины
```
interface IBasket {
  orders: BasketProductItem[];
  totalValue: number;
}
```

Тип товара в корзине
```
type BasketProductItem = Pick<IProduct, 'id' | 'title' | 'price'>;
```

Тип товара во всплывающем окне выбранного товара
```
type PopupProduct = Pick<IProduct, 'category' | 'title' | 'description' | 'price'>;
```

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP: 
- слой данных, отвечает за хранение и изменение данных;
- слой представления, отвечает за отображение данных на странице;
- презентер, отвечает за связь представления и данных.

### Базовый код

#### Класс Api
Содержит в себе базовую логику отправки запросов. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.
Методы: 
- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть переопределен заданием третьего параметра при вызове.

#### Класс EventEmitter
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий.  
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
- `on` - подписка на событие
- `emit` - инициализация события
- `trigger` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие

### Слой данных (Model)
Предназначен для хранения и обработки данных о товарах, заказах, и способах доставки этих заказов

#### Класс Model
- emitChanges(event: string, payload?: object) - Сообщает всем что модель поменялась

#### Класс AppApi
Принимает в конструктор экземпляр класса Api и предоставляет методы реализующие взаимодействие с бэкендом сервиса.
getProductItem - Получить данные о товаре с сервера
IProductList - Получить массив товаров с сервера
sendOrderData - Отправить данные о заказанных товарах, контактных данных, и способе оплаты

#### Класс ProductList
Хранит в себе данные о каталоге товаров ввиде массива
- getProductList - Получить обновленные данные о каталоге товаров

#### Класс ProductItem
Хранит в себе данные о товаре
- getProductItem - Получить обновленные данные о товаре
- setProductItem - Установить обновленные данные о товаре

#### Класс Basket
Хранит в себе данные о товарах, которые пользователь добавил в корзину
- getBasketOrders - Получить обновленные данные о товарах в корзине
- setBasketOrders - Добавить обновленные данные о товарах в корзине
- deleteBasketOrder - Удалить товар их корзины
- getTotalPrice - Получить общую стоимость товаров в корзине
- setTotalPrice - Установить общую стоимость товаров в корзине
- clearBasket - Очистить корзину
- placeAnOrder - Оформить заказ нажатием на кнопку "Оформить"

#### Класс PlacedOrder
Хранит в себе данные об оформленном заказе. Данные отправляются сюда из корзины
getOrder - Получить данные об оформленном заказе с сервера
sendOrder - Отправить данные об оформленном заказе на сервер

#### Класс ContactsOrder
Хранит в себе данные о способе оплаты, адресе доставки, E-mail, телефоне
getPayNDeliever - получить данные о способе оплаты и адресе доставки
setPayNDeliever - установить данные о способе оплаты и адресе доставки
getContacts - получить данные о E-mail и телефоне
setContacts - установить данные о E-mail и телефоне

### Слой представления (View)
Отвечает за визуальное отображение данных на странице

#### Класс Component
- toggleClass(element: HTMLElement, className: string, force?: boolean) - Переключить класс
- setText(element: HTMLElement, value: unknown) - Установить текстовое содержимое
- setDisabled(element: HTMLElement, state: boolean) - Поменять статус блокировки
- protected setHidden(element: HTMLElement) - Скрыть элемент
- protected setVisible(element: HTMLElement) - Показать элемент
- setImage(element: HTMLImageElement, src: string, alt?: string) - Установить изображение с алтернативным текстом
- render(data?: Partial<T>): HTMLElement - Вернуть корневой DOM-элемент

#### Класс MainPageView
Отвечает за отображение и взаимодействие с элементами на главной странице. 
Содержит поля:
basketCounter - html-элемент счётчика общей стоимости товаров в корзине
basketClick - html-элемент кнопки для открытия корзины
productListElement - html-элемент каталога товаров

#### Класс CardView
Отвечает за отображение и взаимодействие с элементами карточки
Содержит поля:
categoryCardElement;
titleCardElement;
descriptionCardElement
imageCardElement;
priceCardElement;

Содержит методы:
set Category() - устанавливает картегорию
set Title() - размещает контент для загололвка
set Description() - размещает контент для описания
set Image() - размещает картинку
set Price() - устанавливает стоимость товара

#### Класс BasketView
Отвечает за отображение взаимодействие с элементами корзины.
Содержит методы:
set productItems() - установить массив товаров в корзину
set totalPriceNumber() - установить общую стоимость товаров в корзине

#### Класс PayOrderView
Отвечает за отображение информации по поводу способа оплаты и адреса доставки
Содержит методы:
set PayOption() - отвечает за выбор способа оплаты
set DeliveryAdress - отвечает за выбор адреса доставки
set ButtonPayOrder() - отвечает за статус кнопки во время воода данных

#### Класс ContactsView
Отвечает за отображение информации по поводу контактных данных человек, который оформляет заказ
Содержит методы:
set Email() - отвечает за выбор электронной почты
set PhoneNumber - отвечает за выбор номера телефона
set ButtonContacts() - отвечает за статус кнопки во время воода данных

#### Класс PlacedOrder
Отвечает за отображение информации об успешно оформленном заказе
Содержит поля:
_totalPrice - разметка итоговой стоимости товара
_newBuying - разметка кнопки "За новыми покупками"

Содержит методы:
set OrderTotalPrice - устанавливает итоговую стоимость товара