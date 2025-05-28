const { createProxyMiddleware } = require('http-proxy-middleware');

const { BASE_URL } = require('../../src/constants/BASE_URL');

module.exports = (app, options) => {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    const addProdMiddlewares = require('./addProdMiddlewares');
    addProdMiddlewares(app, options);
  } else {
    app.use('/api',
      createProxyMiddleware({
        target: BASE_URL,
        secure: false,
        changeOrigin: true,
      }));
    app.use('/model',
      createProxyMiddleware({
        target: `${BASE_URL}`,
        secure: false,
        changeOrigin: true,
      }));
    const webpackConfig = require('../../webpack/webpack.dev.babel');
    const addDevMiddlewares = require('./addDevMiddlewares');
    addDevMiddlewares(app, webpackConfig);
  }
  return app;
};
