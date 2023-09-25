const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const port = 3000;
const baseUrl = 'https://medium.com'
app.use(cors({
  origin: '*'
}));
app.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const url = `https://medium.com/search/users?q=${query}`;

    const response = await axios.get(url);

    const $ = cheerio.load(response.data);
    const articles = $('div.kh.bg.l')
    const topics = $('div.hz.ab')
    const results = []
    const topicsMatch = []

    articles.each((index, element) => {
      const article = $(element);
      const articleInfo = extractArticleInfo(article);
      results.push(articleInfo);
    });

    topics.each((index, elements) => {
      const topic = $(elements);
      topicsMatch.push(topic.text());
    });

  res.json({topics:topicsMatch ,results: results});
  } catch (error) {
    console.error('Falha na requisição:', error.message);
    res.status(500).json({ error: 'Erro ao realizar a busca' });
  }
});

function extractArticleInfo(article) {
  const image = article.find('img').attr('src');
  const description = article.find('p').first().text();
  const author = article.find('img').attr('alt');
  const link = article.find('a.af.ag.ah.ai.aj.ak.al.am.an.ao.ap.aq.ar.as.at').attr('href');

  return {
    image,
    description,
    author,
    link: link.includes('http') ? link : `${baseUrl}${link}`
  };
}
app.listen(port, () => {
  console.log(`Servidor escutando na porta ${port}`);
});
