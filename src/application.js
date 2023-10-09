import i18next from 'i18next';
import { string, setLocale } from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import _ from 'lodash';
import resources from './locales/texts.js';
import parse from './parser.js';
import render from './render.js';

const addProxy = (url) => {
  const actualUrl = new URL('https://allorigins.hexlet.app/get');
  actualUrl.searchParams.set('disableCache', 'true');
  actualUrl.searchParams.set('url', url);
  return actualUrl.toString();
};

const addId = (feed, posts) => {
  feed.id = _.uniqueId();
  posts.forEach((post) => {
    post.id = _.uniqueId();
    post.listId = feed.id;
  });
};

const loadData = (state, url) => {
  axios.get(addProxy(url))
    .then((response) => {
      const { feed, posts } = parse(response.data.contents);
      addId(feed, posts);
      feed.url = url;
      state.loadingData.error = null;
      state.form.error = null;
      state.feeds = [feed, ...state.feeds];
      state.posts = [...posts, ...state.posts];
      state.loadingData.status = 'success';
    })
    .catch((error) => {
      if (error.isParsingError) {
        state.loadingData.error = 'errors.notRss';
        state.loadingData.status = 'failed';
        return;
      }
      if (error.isAxiosError) {
        state.loadingData.error = 'errors.networkError';
        state.loadingData.status = 'failed';
        return;
      } state.loadingData.error = 'errors.uknownError';
      state.loadingData.status = 'failed';
    });
};

const updatePosts = (state) => {
  const delayTime = 5000;
  const handler = () => {
    const promises = state.feeds.map(({ url, id }) => axios.get(addProxy(url))
      .then((response) => {
        const { posts } = parse(response.data.contents);
        const currentPosts = state.posts.filter((post) => post.listId === id);
        const currentTitles = posts.map(({ postTitle }) => postTitle);
        const newPost = currentPosts.filter(({ postTitle }) => !currentTitles.includes(postTitle));
        state.posts = [...newPost, ...state.posts];
      })
      .catch((e) => console.error(e)));
    Promise.all(promises).finally(() => setTimeout(() => handler(), delayTime));
  };
  handler();
};

const app = () => {
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  })
    .then(() => {
      const elements = {
        form: document.querySelector('.rss-form'),
        input: document.querySelector('#url-input'),
        feedback: document.querySelector('.feedback'),
        containerFeeds: document.querySelector('.feeds'),
        containerPosts: document.querySelector('.posts'),
        modal: document.getElementById('modal'),
        submit: document.querySelector('.rss-form button[type="submit"]'),
      };

      const initialState = {
        form: {
          error: null,
        },
        loadingData: {
          error: null,
          status: 'idle',
        },
        feeds: [],
        posts: [],
        ui: {
          currentPost: null,
          openedPostsId: [],
        },
      };

      const watchedState = onChange(initialState, (path, value) => {
        render(watchedState, i18nextInstance, elements, path, value);
      });

      setLocale({
        string: {
          url: ({ url }) => ({ key: 'errors.notUrl', values: { url } }),
        },
        mixed: {
          notOneOf: ({ notOneOf }) => ({ key: 'errors.notOneOf', values: { notOneOf } }),

        },
      });

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const urls = watchedState.feeds.map(({ url }) => url);
        const schema = string().url().nullable().notOneOf(urls);
        const formData = new FormData(elements.form);
        const url = formData.get('url');
        schema.validate(url)
          .then((validUrl) => {
            loadData(watchedState, validUrl);
          })
          .catch((error) => {
            const errorKey = error.message.key;
            watchedState.form.error = errorKey;
          });
      });

      elements.containerPosts.addEventListener('click', (e) => {
        const currentId = e.target.dataset.id;
        if (currentId) {
          watchedState.ui.currentPost = currentId;
          if (!watchedState.ui.openedPostsId.includes(currentId)) {
            watchedState.ui.openedPostsId = [currentId, ...watchedState.ui.openedPostsId];
          }
        }
      });

      updatePosts(watchedState);
    });
};

export default app;
