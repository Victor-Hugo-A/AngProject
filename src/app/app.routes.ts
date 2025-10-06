import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { signUpComponent } from './pages/signup/signup';
import { User } from './pages/user/user';
import { AuthGuard } from './services/auth-guard.service';
import { Forgot } from './pages/forgot/forgot';

export const routes: Routes = [

    {
    path: "",
    redirectTo: "/login",
    pathMatch: "full"
    },
    {
        path: "login",
        component: Login
    },
    {
        path: "signup",
        component: signUpComponent
    },
    {
        path: "user",
        component: User,
        canActivate: [AuthGuard]
    },
    {
        path: "forgot",
        component: Forgot
    }
];
