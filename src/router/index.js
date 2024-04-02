import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import DashboardView from "../views/DashboardView.vue";
import HistoryView from "../views/HistoryView.vue";
import MeasurementsView from "../views/MeasurementsView.vue";
import SettingsView from "../views/SettingsView.vue";
import LoginView from "../views/LoginView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            redirect: { name: "dashboard" },
        },
        {
            path: "/dashboard",
            name: "dashboard",
            component: DashboardView,
        },
        {
            path: "/history",
            name: "history",
            component: HistoryView,
        },
        {
            path: "/measurements",
            name: "measurements",
            component: MeasurementsView,
        },
        {
            path: "/settings",
            name: "settings",
            component: SettingsView,
        },
        {
            path: "/login",
            name: "login",
            component: LoginView,
        },
    ],
});

function checkAuthentication(to, from, next) {

}

export default router;
