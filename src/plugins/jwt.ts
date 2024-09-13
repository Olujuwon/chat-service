import Hapi from "@hapi/hapi";

import * as dotenv from "dotenv";

dotenv.config();

declare module "@hapi/hapi" {
    interface ServerApplicationState {
        jwt: any;
    }
}

const jwtPlugin: Hapi.Plugin<null> = {
    name: "jwt",
    register: async (server: Hapi.Server) => {
        server.app.jwt = require("jsonwebtoken");
    },
};

export default jwtPlugin;
