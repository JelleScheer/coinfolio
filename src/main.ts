import { createApp } from 'vue';
import FontAwesomeIcon from './font-awesome';
import { stateSymbol, createState } from './store';
import App from './App.vue';
import router from './router/index';
import './index.css';

const app = createApp(App);

app.directive('focus', {
  mounted(el) {
    el.focus();
  },
});

app.component('fa', FontAwesomeIcon);
app.use(router);
app.provide(stateSymbol, createState());
app.mount('#app');
