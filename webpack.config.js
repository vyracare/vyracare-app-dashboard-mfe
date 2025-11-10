const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  output: {
    uniqueName: "vyracare_app_dashboard_mfe",
    publicPath: "auto",
    scriptType: 'module'
  },
  optimization: { runtimeChunk: false },
  experiments: {
    outputModule: true
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "dashboard",
      filename: "remoteEntry.js",
      library: { type: 'module' },
      exposes: {
        './App': './src/app/app.ts'
      },
      shared: ["@angular/core", "@angular/common", "@angular/router"]
    })
  ],
};
