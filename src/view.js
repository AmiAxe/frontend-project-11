import onChange from 'on-change';

const renderState = (value, watchedState, i18n, elements) => {
  if (value === 'invalid') {
    const { error } = watchedState;
    elements.buttonSubmit.disabled = false;
    elements.input.classList.add('is-invalid');
    elements.feedback.classList.remove('text-success');
    elements.feedback.classList.add('text-danger');
    elements.feedback.textContent = i18n.t(error);
  }
  if (value === 'valid') {
    elements.buttonSubmit.disabled = false;
    elements.input.classList.remove('is-invalid');
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.add('text-success');
    elements.feedback.textContent = i18n.t('success');
    elements.form.reset();
  }
  if (value === 'loading') {
    elements.buttonSubmit.disabled = true;
  }
};

const renderFeeds = (watchedState, elements, i18n) => {
  const feedsHeader = elements.feeds.querySelector('.card-body');
  const feedsList = elements.feeds.querySelector('.list-group');
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18n.t('feeds');
  feedsHeader.innerHTML = '';
  feedsHeader.append(h2);

  feedsList.innerHTML = '';
  watchedState.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;
    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;
    li.append(p);
    li.prepend(h3);
    feedsList.prepend(li);
  });
};

const renderPosts = (watchedState, elements, i18n) => {
  const postsHeader = elements.posts.querySelector('.card-body');
  const postsList = elements.posts.querySelector('.list-group');
  postsHeader.innerHTML = '';
  const h2Posts = document.createElement('h2');
  h2Posts.classList.add('card-title', 'h4');
  h2Posts.textContent = i18n.t('posts');
  postsHeader.append(h2Posts);

  postsList.innerHTML = '';
  watchedState.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    a.setAttribute('href', post.url);
    if (!watchedState.uiState.viewedPosts.includes(post.id)) {
      a.classList.add('fw-bold');
    } else {
      a.classList.add('fw-normal', 'link-secondary');
    }
    a.setAttribute('data-id', post.id);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = post.title;
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('data-id', post.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18n.t('browse');
    li.append(a);
    li.append(button);
    postsList.prepend(li);
  });
};

const renderModal = (watchedState, elements, id) => {
  const post = watchedState.posts.find((item) => item.id === id);
  const modalTitle = elements.modal.querySelector('.modal-title');
  modalTitle.textContent = post.title;
  const modalDescription = elements.modal.querySelector('.modal-body');
  modalDescription.textContent = post.description;
  const readCompletely = elements.modal.querySelector('.full-article');
  readCompletely.setAttribute('href', post.url);
};

const render = (state, i18nInstance, elements) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'status') {
      renderState(value, state, i18nInstance, elements);
    }
    if (path === 'feeds') {
      renderFeeds(state, elements, i18nInstance);
    }
    if (path === 'posts') {
      renderPosts(state, elements, i18nInstance);
    }
    if (path === 'uiState.viewedPosts') {
      renderPosts(state, elements, i18nInstance);
    }
    if (path === 'uiState.idModal') {
      renderModal(state, elements, value);
    }
  });

  return { watchedState };
};

export default render;
