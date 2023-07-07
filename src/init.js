import 'bootstrap';
import axios from 'axios';
import * as yup from 'yup';
import { isEmpty, keyBy, uniqueId } from 'lodash';
import i18n from 'i18next';
import parser from './parser.js';
import render from './view.js';
import resources from './locales/resources.js';
import yupSetLocale from './locales/yupLocales.js';

const createUrl = (usersUrl) => {
  const url = new URL('https://allorigins.hexlet.app/get');
  url.searchParams.append('disableCache', 'true');
  url.searchParams.append('url', usersUrl);
  return url.toString();
};

const firstRequestData = (urlValue, watchedState) => {
  const urlRequest = createUrl(urlValue);
  return axios.get(urlRequest, { timeout: 5000 })
    .then((response) => {
      const { contents } = response.data;
      const parsedContent = parser(contents);
      const feedId = uniqueId();
      parsedContent.dataFeed.url = urlValue;
      parsedContent.dataFeed.id = feedId;
      watchedState.feeds.push(parsedContent.dataFeed);
      const newPosts = [];
      parsedContent.dataPosts.forEach((itemPost) => {
        const newPost = itemPost;
        newPost.id = uniqueId();
        newPost.feedID = feedId;
        newPosts.push(newPost);
      });
      watchedState.posts = [...watchedState.posts, ...newPosts];
      watchedState.status = 'valid';
    })
    .catch((err) => {
      if (err.isParsingError) {
        watchedState.error = 'fall';
        watchedState.status = 'invalid';
      } else {
        watchedState.error = 'networkError';
        watchedState.status = 'invalid';
      }
    });
};

const updateData = (watchedState) => {
  const tick = () => {
    Promise.all(watchedState.feeds.map((feed) => {
      const urlRequest = createUrl(feed.url);
      return axios.get(urlRequest, { timeout: 5000 })
        .then((response) => {
          const { contents } = response.data;
          const parsedContent = parser(contents);
          const newPosts = [];
          parsedContent.dataPosts.forEach((itemPost) => {
            const filter = watchedState.posts
              .filter((post) => post.feedID === feed.id)
              .filter((post) => post.title === itemPost.title);
            if (filter.length === 0) {
              const newPost = itemPost;
              newPost.id = uniqueId();
              newPost.feedID = feed.id;
              newPosts.push(newPost);
            }
          });
          watchedState.posts = [...watchedState.posts, ...newPosts];
        })
        .catch((err) => {
          console.log(err);
        });
    }))
      .then(() => {
        setTimeout(tick, 5000);
      });
  };
  setTimeout(tick, 5000);
};

export default () => {
  const i18nInstance = i18n.createInstance();
  return i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  })
    .then(() => {
      const state = {
        status: 'filling',
        error: null,
        feeds: [],
        posts: [],
        uiState: {
          viewedPosts: [],
          idModal: '',
        },
      };

      yupSetLocale();

      const newShema = (urls) => {
        const schema = yup.object({
          url: yup.string().url().notOneOf(urls),
        });
        return schema;
      };

      const validate = (fields, urls) => {
        const s = newShema(urls);
        return s.validate(fields, { abortEarly: false })
          .then(() => ({}))
          .catch((err) => keyBy(err.inner, 'path'));
      };

      const elements = {
        form: document.querySelector('form'),
        input: document.querySelector('#url-input'),
        buttonSubmit: document.querySelector('[type="submit"]'),
        modal: document.querySelector('#modal'),
        feedback: document.querySelector('.feedback'),
        feeds: document.querySelector('.feeds'),
        posts: document.querySelector('.posts'),
      };

      const { watchedState } = render(state, i18nInstance, elements);

      elements.posts.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        if (!watchedState.uiState.viewedPosts.includes(id)) {
          watchedState.uiState.viewedPosts.push(id);
          watchedState.uiState.idModal = id;
        }
      });

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedState.status = 'loading';
        const formData = new FormData(elements.form);
        const value = formData.get('url');
        validate({ url: value }, watchedState.feeds.map((feed) => feed.url))
          .then((checkValid) => {
            if (isEmpty(checkValid)) {
              return firstRequestData(value, watchedState);
            }
            watchedState.error = checkValid.url.message;
            watchedState.status = 'invalid';
            return Promise.resolve();
          });
      });

      updateData(watchedState);
    });
};
