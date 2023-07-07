import * as yup from 'yup';

export default () => {
  yup.setLocale({
    mixed: {
      notOneOf: 'notOneOf',
    },
    string: {
      url: 'notValid',
    },
  });
};
