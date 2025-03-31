"use client"; 

import React, { ReactNode } from "react";
import AppWrappers from "./AppWrappers";
import { Provider } from "react-redux";
import store from "../redux/store";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body id="root">
        <Provider store={store}> 
          <AppWrappers>{children}</AppWrappers>
        </Provider>
      </body>
    </html>
  );
}
