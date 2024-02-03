import Router from "next/router";

export const checkSession = () => {
  const userId = localStorage.getItem("userId");
  console.log(userId);

  if (!userId) {
    Router.push("/login");
  }
};

export const getUserId = () => {
  return localStorage.getItem("userId");
};

export const setSession = (userId) => {
  localStorage.setItem("userId", userId);
};

export const clearSession = () => {
  localStorage.removeItem("userId");
  Router.push("/login");
};
