const handleLoadingStatus = (state, value, i18, {
  feedback, input, form, submit,
}) => {
  switch (value) {
    case 'loading':
      submit.disabled = true;
      break;

    case 'success':
      submit.disabled = false;
      feedback.classList.replace('text-danger', 'text-success');
      feedback.textContent = i18.t('success.rssLoaded');
      input.classList.remove('is-invalid');
      form.reset();
      input.focus();
      break;

    case 'failed':
      submit.disabled = false;
      input.classList.add('is-invalid');
      feedback.classList.replace('text-success', 'text-danger');
      feedback.textContent = i18.t(state.loadingData.error);
      input.focus();
      break;

    default:
      throw new Error(`Неизвестное значение: ${value}`);
  }
};

const renderFormErrors = (initialState, i18, { feedback, input }) => {
  if (initialState.form.error !== null) {
    input.classList.add('is-invalid');
    feedback.classList.replace('text-success', 'text-danger');
    feedback.textContent = i18.t(initialState.form.error);
  } else {
    input.classList.remove('is-invalid');
    feedback.classList.replace('text-danger', 'text-success');
    feedback.textContent = i18.t('success.empty');
  }
};

const renderFeeds = (initialState, i18, { containerFeeds }) => {
  const divFeeds = document.createElement('div');
  divFeeds.classList.add('card', 'border-0');
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18.t('feedsHeadline');
  const div2 = document.createElement('div');
  div2.classList.add('card-body');
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  initialState.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;
    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;
    li.append(h3);
    h3.append(p);
    ul.append(li);
  });
  containerFeeds.textContent = '';
  containerFeeds.append(divFeeds);
  divFeeds.append(div2);
  divFeeds.append(ul);
  div2.append(h2);
};

const addTextInModal = (initialState, i18, { modal }) => {
  const postId = initialState.ui.currentPost;
  const currentPostData = initialState.posts.find((elem) => elem.id === postId);
  const currentPostTitle = currentPostData.postTitle;
  const currentPostDescription = currentPostData.postDescription;
  const currentPostLink = currentPostData.postLink;
  const popupTitle = modal.querySelector('.modal-title');
  popupTitle.textContent = currentPostTitle;
  const popupDescription = modal.querySelector('.modal-body');
  popupDescription.textContent = currentPostDescription;
  const postLink = modal.querySelector('.full-article');
  postLink.setAttribute('href', currentPostLink);
  const modalReadButton = modal.querySelector('.btn-primary');
  const modalCLoseButton = modal.querySelector('.btn-secondary');
  modalReadButton.textContent = i18.t('elements.modalReadButton');
  modalCLoseButton.textContent = i18.t('elements.modalCLoseButton');
};

const handlePostLink = (initialState, containerPosts) => {
  initialState.posts.forEach(({ id }) => {
    if (initialState.ui.openedPostsId.includes(id)) {
      const a = containerPosts.querySelector(`a[data-id="${id}"]`);
      a.classList.replace('fw-bold', 'fw-normal');
      a.classList.add('link-secondary');
    }
  });
};

const renderPosts = (initialState, i18, { containerPosts }) => {
  containerPosts.textContent = '';
  const divPosts = document.createElement('div');
  divPosts.classList.add('card', 'border-0');
  const innerDiv = document.createElement('div');
  innerDiv.classList.add('card-body');
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18.t('postsHeadline');
  containerPosts.append(divPosts);
  divPosts.append(innerDiv);
  innerDiv.append(h2);
  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  initialState.posts.map((elem) => {
    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.dataset.id = elem.id;
    button.textContent = i18.t('elements.feedButtonText');
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    ul.append(li);
    const a = document.createElement('a');
    a.classList.add('fw-bold');
    a.setAttribute('href', `${elem.postLink}`);
    a.setAttribute('target', 'blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.dataset.id = elem.id;
    a.textContent = elem.postTitle;
    li.append(a);
    li.append(button);
    return li;
  });
  divPosts.append(ul);
  handlePostLink(initialState, containerPosts);
};

const render = (state, i18next, elements, path, value) => {
  switch (path) {
    case 'feeds':
      renderFeeds(state, i18next, elements);
      break;

    case 'posts':
      renderPosts(state, i18next, elements);
      break;

    case 'ui.currentPost':
      addTextInModal(state, i18next, elements);
      break;

    case 'ui.openedPostsId':
      handlePostLink(state, elements.containerPosts);
      break;

    case 'form.error':
      renderFormErrors(state, i18next, elements);
      break;

    case 'loadingData.status':
      handleLoadingStatus(state, value, i18next, elements);
      break;

    default:
      break;
  }
};

export default render;
