const parse = (response) => {
  const parser = new DOMParser();
  const data = parser.parseFromString(response, 'text/xml');
  const parseError = data.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParsingError = true;
    throw error;
  }
  const title = data.querySelector('title').textContent;
  const description = data.querySelector('description').textContent;
  const feed = {
    title, description,
  };
  const items = data.querySelectorAll('item');
  const posts = Array.from(items).map((item) => {
    const postTitle = item.querySelector('title').textContent;
    const postLink = item.querySelector('link').textContent;
    const postDescription = item.querySelector('description').textContent;
    const post = {
      postTitle,
      postLink,
      postDescription,
    };
    return post;
  });
  return { feed, posts };
};

export default parse;
