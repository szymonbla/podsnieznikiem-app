/**
 * GENERATED FILE — do not edit by hand.
 * Source: the server's OpenAPI document. Regenerate with `bun run gen:api`.
 */

export interface paths {
    "/contacts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Returns every contact, ordered by name */
        get: operations["contacts.list"];
        put?: never;
        /** @description Creates a contact; requires all three fields */
        post: operations["contacts.create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/contacts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** @description Deletes a contact permanently */
        delete: operations["contacts.remove"];
        options?: never;
        head?: never;
        /** @description Updates the given fields of a contact */
        patch: operations["contacts.update"];
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @description a string to be decoded into a DateTime.Utc */
        DateTimeUtc: string;
        /** @description The request did not match the expected schema */
        HttpApiDecodeError: {
            issues: components["schemas"]["Issue"][];
            message: string;
            /** @enum {string} */
            _tag: "HttpApiDecodeError";
        };
        /** @description Represents an error encountered while parsing a value to match the schema */
        Issue: {
            /**
             * @description The tag identifying the type of parse issue
             * @enum {string}
             */
            _tag: "Pointer" | "Unexpected" | "Missing" | "Composite" | "Refinement" | "Transformation" | "Type" | "Forbidden";
            /** @description The path to the property where the issue occurred */
            path: components["schemas"]["PropertyKey"][];
            /** @description A descriptive message explaining the issue */
            message: string;
        };
        PropertyKey: string | number | {
            /** @enum {string} */
            _tag: "symbol";
            key: string;
        };
        ContactNotFound: {
            /**
             * Format: uuid
             * @description a Universally Unique Identifier
             */
            id: string;
            /** @enum {string} */
            _tag: "ContactNotFound";
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    "contacts.list": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /**
                         * Format: uuid
                         * @description a Universally Unique Identifier
                         */
                        id: string;
                        /**
                         * maxLength(100)
                         * @description a string at most 100 character(s) long
                         */
                        name: string;
                        /**
                         * maxLength(60)
                         * @description a string at most 60 character(s) long
                         */
                        role: string;
                        /** @description a string matching the pattern ^\d{9}$ */
                        phone: string;
                        createdAt: components["schemas"]["DateTimeUtc"];
                        updatedAt: components["schemas"]["DateTimeUtc"];
                    }[];
                };
            };
            /** @description The request did not match the expected schema */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HttpApiDecodeError"];
                };
            };
        };
    };
    "contacts.create": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description a string that will be trimmed */
                    name: string;
                    /** @description a string that will be trimmed */
                    role: string;
                    /** @description a string matching the pattern ^\d{9}$ */
                    phone: string;
                };
            };
        };
        responses: {
            /** @description Success */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /**
                         * Format: uuid
                         * @description a Universally Unique Identifier
                         */
                        id: string;
                        /**
                         * maxLength(100)
                         * @description a string at most 100 character(s) long
                         */
                        name: string;
                        /**
                         * maxLength(60)
                         * @description a string at most 60 character(s) long
                         */
                        role: string;
                        /** @description a string matching the pattern ^\d{9}$ */
                        phone: string;
                        createdAt: components["schemas"]["DateTimeUtc"];
                        updatedAt: components["schemas"]["DateTimeUtc"];
                    };
                };
            };
            /** @description The request did not match the expected schema */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HttpApiDecodeError"];
                };
            };
        };
    };
    "contacts.remove": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description a Universally Unique Identifier */
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Success */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description The request did not match the expected schema */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HttpApiDecodeError"];
                };
            };
            /** @description ContactNotFound */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ContactNotFound"];
                };
            };
        };
    };
    "contacts.update": {
        parameters: {
            query?: never;
            header?: never;
            path: {
                /** @description a Universally Unique Identifier */
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": {
                    /** @description a string that will be trimmed */
                    name?: string;
                    /** @description a string that will be trimmed */
                    role?: string;
                    /** @description a string matching the pattern ^\d{9}$ */
                    phone?: string;
                };
            };
        };
        responses: {
            /** @description Success */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /**
                         * Format: uuid
                         * @description a Universally Unique Identifier
                         */
                        id: string;
                        /**
                         * maxLength(100)
                         * @description a string at most 100 character(s) long
                         */
                        name: string;
                        /**
                         * maxLength(60)
                         * @description a string at most 60 character(s) long
                         */
                        role: string;
                        /** @description a string matching the pattern ^\d{9}$ */
                        phone: string;
                        createdAt: components["schemas"]["DateTimeUtc"];
                        updatedAt: components["schemas"]["DateTimeUtc"];
                    };
                };
            };
            /** @description The request did not match the expected schema */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["HttpApiDecodeError"];
                };
            };
            /** @description ContactNotFound */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ContactNotFound"];
                };
            };
        };
    };
}
