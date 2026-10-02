const { ModuleFederationPlugin } = require('webpack').container;
const deps = require('./package.json').dependencies;

const shared = {
  "@angular/core": { singleton: true, strictVersion: true, requiredVersion: deps["@angular/core"] },
  "@angular/common": { singleton: true, strictVersion: true, requiredVersion: deps["@angular/common"] },
  "@angular/common/http": { singleton: true, strictVersion: true, requiredVersion: deps["@angular/common"] },
  "@angular/router": { singleton: true, strictVersion: true, requiredVersion: deps["@angular/router"] },
  "@angular/forms": { singleton: true, strictVersion: true, requiredVersion: deps["@angular/forms"] },
  "rxjs": { singleton: true, strictVersion: true, requiredVersion: deps["rxjs"] }
};

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
        './App': './src/app/app.ts',
        './Routes': './src/app/app.routes.ts'
      },
      shared
    })
  ],
};
