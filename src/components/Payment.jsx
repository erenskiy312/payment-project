import React, { useState } from 'react';
import InputMask from 'react-input-mask';
import './index.scss';
import CryptoJS from 'crypto-js';
import CurrencyInput from 'react-currency-input-field';

const Payment = () => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [amount, setAmount] = useState('500');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('Экскурсия');
  const [errors, setErrors] = useState({});

  const initiator = 'Иван К.';
  const collectionName = 'Экскурсия';

  // Лун алгоритм для проверки номера карты
  const validateCardNumber = (number) => {
    let sum = 0;
    let shouldDouble = false;
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i]);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  // Проверка всех полей формы
  const validateForm = () => {
    const newErrors = {};
    if (!validateCardNumber(cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Неверный номер карты';
    }
    if (!expiryDate.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) {
      newErrors.expiryDate = 'Неверный формат MM/YY';
    }
    if (cvv.length !== 3) {
      newErrors.cvv = 'CVV должен содержать 3 цифры';
    }
    if (amount < 10) {
      newErrors.amount = 'Минимальная сумма 10 рублей';
    }
    if (name.length > 50) {
      newErrors.name = 'Имя не может превышать 50 символов';
    }
    if (message.length > 50) {
      newErrors.message = 'Сообщение не может превышать 50 символов';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Возвращаем true, если нет ошибок
  };

  // Генерация hash_sum
  const generateHashSum = (transaction, amount) => {
    const apiKey = "316b2be8-3475-4462-bd57-c7794d4bdb53";
    const secret = "1234567890";
    const rawString = `${apiKey}${transaction}${amount * 100}${secret}`; // Используем шаблонные строки
    return CryptoJS.SHA256(rawString).toString();
  };

  // Обработка отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return; // Если есть ошибки, не отправляем форму
    }

    const transactionId = Date.now().toString();
    const hashSum = generateHashSum(transactionId, amount);

    const data = {
      api_key: "316b2be8-3475-4462-bd57-c7794d4bdb53",
      transaction: transactionId,
      description: `${initiator} собирает на ${collectionName}`,
      amount: parseInt(amount) * 100,
      hash_sum: hashSum,
      custom_data: { initiator, collectionName },
    };

    console.log("Данные для отправки:", data);
    // Здесь можно сделать POST запрос для отправки на сервер или перенаправление на страницу подтверждения
  };

  return (
    <form className="payment-form" onSubmit={handleSubmit}>
      <h2>{`${initiator} собирает на «${collectionName}»`}</h2>

      <label>Номер карты</label>
      <InputMask
        mask="9999 9999 9999 9999"
        value={cardNumber}
        onChange={(e) => { setCardNumber(e.target.value); setErrors({ ...errors, cardNumber: undefined }); }} // Сбрасываем ошибку при изменении
        required
      />
      {errors.cardNumber && <div className="error">{errors.cardNumber}</div>} {/* Ошибка под полем */}

      {/* Поля срока действия и CVV */}
      <div className="input-group">
        <div>
          <label>Срок действия</label>
          <InputMask
            mask="99/99"
            placeholder="ММ/ГГ"
            value={expiryDate}
            onChange={(e) => { setExpiryDate(e.target.value); setErrors({ ...errors, expiryDate: undefined }); }}
            required
          />
          {errors.expiryDate && <div className="error">{errors.expiryDate}</div>} 
        </div>

        <div className="input-field">
          <label>CVV</label>
          <input
            type='password'
            value={cvv.length > 0 ? '•••'.slice(0, cvv.length) : ''}
            onChange={(e) => { setCvv(e.target.value); setErrors({ ...errors, cvv: undefined }); }}
            required
          />
          {errors.cvv && <div className="error">{errors.cvv}</div>}
        </div>
      </div>

      <label>Сумма перевода</label>
       
          <CurrencyInput
          id='currency-input'
          name='currency-input'
          min="10"
          value={amount.replace(/[^\d.-]/g, '')}
          prefix="₽"
          decimalScale={2}
          onChange={(e) => { setAmount(e.target.value); setErrors({ ...errors, amount: undefined }); }}
          />
          {errors.amount && <div className="error">{errors.amount}</div>}

      <label>Ваше имя</label>
      <input
        type="text"
        maxLength="50"
        value={name}
        onChange={(e) => { setName(e.target.value); setErrors({ ...errors, name: undefined }); }}
        required
      />
      {errors.name && <div className="error">{errors.name}</div>}

      <label>Сообщение получателю</label>
      <input
        type="text"
        maxLength="50"
        value={message}
        onChange={(e) => { setMessage(e.target.value); setErrors({ ...errors, message: undefined }); }}
      />
      {errors.message && <div className="error">{errors.message}</div>}

      <button type="submit">Перевести</button>
      <button className='button-back' type="button" onClick={() => window.history.back()}>Вернуться</button>
    </form>
  );
};

export default Payment;
