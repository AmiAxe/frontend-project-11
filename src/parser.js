export default (content) => {
  const domParser = new DOMParser();
  const parsedContent = domParser.parseFromString(content, 'text/xml');
  const parseError = parsedContent.querySelector('parsererror');
  if (parseError) {
    const error = new Error(parseError.textContent);
    error.isParsingError = true;
    throw error;
  }
  const titleFeeds = parsedContent.querySelector('title');
  const descriptionFeeds = parsedContent.querySelector('description');
  const dataFeed = {
    title: titleFeeds.textContent,
    description: descriptionFeeds.textContent,
  };
  const dataPosts = [];
  const itemsPosts = parsedContent.querySelectorAll('item');
  itemsPosts.forEach((item) => {
    const link = item.querySelector('link');
    const url = link.textContent;
    const title = item.querySelector('title');
    const description = item.querySelector('description');
    const post = {
      title: title.textContent,
      description: description.textContent,
      url,
    };
    dataPosts.push(post);
  });
  return { dataFeed, dataPosts };
};
