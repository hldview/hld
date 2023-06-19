// 引入vue
import Vue from 'vue';
import App from './app.vue';
// 引入CSS
import './assets/common.css';

const root = document.createElement('div');
document.body.appendChild(root);

// new Vue ({
//     el: root,
//     template: App
// });

new Vue({
    render: (h) => h(App)
}).$mount(root);



