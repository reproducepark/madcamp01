// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],   // Expo 프로젝트라면 이 프리셋
    plugins: [
      // 예: .env 파일을 쓰고 싶다면
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }],
      // 필요하다면 추가 플러그인 여기에
    ],
  };
};
