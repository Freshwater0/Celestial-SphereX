export const formatReportContent = (data, topic, keywords) => {
  const title = `${topic} Report: ${keywords.join(', ')}`;
  const subheadings = data.map((item, index) => `Section ${index + 1}: ${item.title || item.name}`);
  const contentSections = data.map((item, index) => ({
    title: subheadings[index],
    content: item.content || item.description || JSON.stringify(item, null, 2),
    type: item.type || 'text'
  }));

  const references = data.map((item) => item.source || item.url || 'Unknown Source');

  return {
    title,
    sections: contentSections,
    references
  };
};
