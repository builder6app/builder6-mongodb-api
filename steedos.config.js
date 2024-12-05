require('dotenv-flow').config({});

module.exports = {
  namespace: 'steedos',
  transporter: process.env.STEEDOS_TRANSPORTER,
};
