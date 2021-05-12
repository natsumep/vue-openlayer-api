const path = require('path');
module.exports = {
  lintOnSave: false,
  productionSourceMap: false,
	chainWebpack: (config)=>{
	    config.resolve.alias
				.set('@/', path.join(__dirname,'src/'))
				config.module
				.rule('image')
				.test(/\.cur$/)
				.use('url-loader')
				.loader('url-loader')
  	}
}
