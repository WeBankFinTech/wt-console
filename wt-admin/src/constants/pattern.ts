const pattern = {
  phoneNumber: /^1[3456789]\d{9}$/,
  password: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,20}$/,
  smsVerificationCode: /^[0-9]{6}$/,
  captcha: /^[a-z0-9A-Z]{4}$/
};

export default pattern;
