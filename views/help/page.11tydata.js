export default {
  eleventyComputed: {
    title: (/** @type {{ topic: { title: string } }} */ data) => `${data.topic.title} – Help`,
    description: (/** @type {{ topic: { title: string } }} */ data) => `Deaftly help: ${data.topic.title}.`,
  },
};
