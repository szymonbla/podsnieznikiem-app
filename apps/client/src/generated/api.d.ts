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
    "/tasks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** @description Every task, with dueDate/overdue/done computed against today */
        get: operations["tasks.list"];
        put?: never;
        /** @description Creates a task from a description and a recurrence rule */
        post: operations["tasks.create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tasks/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** @description Deletes a task permanently */
        delete: operations["tasks.remove"];
        options?: never;
        head?: never;
        /** @description Updates the description and/or the whole recurrence rule */
        patch: operations["tasks.update"];
        trace?: never;
    };
    "/tasks/{id}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Marks the current occurrence done, computed against today */
        post: operations["tasks.complete"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/tasks/{id}/uncomplete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** @description Clears the completed marker */
        post: operations["tasks.uncomplete"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
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
        /**
         * int
         * @description an integer
         */
        Int: number;
        TaskNotFound: {
            /**
             * Format: uuid
             * @description a Universally Unique Identifier
             */
            id: string;
            /** @enum {string} */
            _tag: "TaskNotFound";
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
    "tasks.list": {
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
                         * maxLength(200)
                         * @description a string at most 200 character(s) long
                         */
                        description: string;
                        recurrence: {
                            /** @enum {string} */
                            type: "once";
                            /** @description a string matching the pattern ^\d{4}-\d{2}-\d{2}$ */
                            date: string;
                        } | {
                            /** @enum {string} */
                            type: "weekly";
                            /**
                             * between(1, 7)
                             * @description a number between 1 and 7
                             */
                            weekday: components["schemas"]["Int"];
                        } | {
                            /** @enum {string} */
                            type: "monthly";
                            /**
                             * between(1, 31)
                             * @description a number between 1 and 31
                             */
                            dayOfMonth: components["schemas"]["Int"];
                        } | {
                            /** @enum {string} */
                            type: "yearly";
                            /**
                             * between(1, 12)
                             * @description a number between 1 and 12
                             */
                            month: components["schemas"]["Int"];
                            /**
                             * between(1, 31)
                             * @description a number between 1 and 31
                             */
                            day: components["schemas"]["Int"];
                        } | {
                            /** @enum {string} */
                            type: "custom";
                            /**
                             * between(1, 1000)
                             * @description a number between 1 and 1000
                             */
                            intervalValue: components["schemas"]["Int"];
                            /** @enum {string} */
                            intervalUnit: "days" | "weeks" | "months";
                            /** @description a string matching the pattern ^\d{4}-\d{2}-\d{2}$ */
                            anchorDate: string;
                        };
                        completedThrough: string | null;
                        createdAt: components["schemas"]["DateTimeUtc"];
                        updatedAt: components["schemas"]["DateTimeUtc"];
                        /** @description a string matching the pattern ^\d{4}-\d{2}-\d{2}$ */
                        dueDate: string;
                        overdue: boolean;
                        done: boolean;
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
    "tasks.create": {
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
                    description: string;
                    recurrence: {
                        /** @enum {string} */
                        type: "once";
                        /** @description a string matching the pattern ^\d{4}-\d{2}-\d{2}$ */
                        date: string;
                    } | {
                        /** @enum {string} */
                        type: "weekly";
                        /**
                         * between(1, 7)
                         * @description a number between 1 and 7
                         */
                        weekday: components["schemas"]["Int"];
                    } | {
                        /** @enum {string} */
                        type: "monthly";
                        /**
                         * between(1, 31)
                         * @description a number between 1 and 31
                         */
                        dayOfMonth: components["schemas"]["Int"];
                    } | {
                        /** @enum {string} */
                        type: "yearly";
                        /**
                         * between(1, 12)
                         * @description a number between 1 and 12
                         */
                        month: components["schemas"]["Int"];
                        /**
                         * between(1, 31)
                         * @description a number between 1 and 31
                         */
                        day: components["schemas"]["Int"];
                    } | {
                        /** @enum {string} */
                        type: "custom";
                        /**
                         * between(1, 1000)
                         * @description a number between 1 and 1000
                         */
                        intervalValue: components["schemas"]["Int"];
                        /** @enum {string} */
                        intervalUnit: "days" | "weeks" | "months";
                        /** @description a string matching the pattern ^\d{4}-\d{2}-\d{2}$ */
                        anchorDate: string;
                    };
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
                         * maxLength(200)
                         * @description a string at most 200 character(s) long
                         */
                        description: string;
                        recurrence: {
                            /** @enum {string} */
                            type: "once";
                            /** @description a string matching the pattern ^\d{4}-\d{2}-\d{2}$ */
                            date: string;
                        } | {
                            /** @enum {string} */
                            type: "weekly";
                            /**
                             * between(1, 7)
                             * @description a number between 1 and 7
                             */
                            weekday: components["schemas"]["Int"];
                        } | {
                            /** @enum {string} */
                            type: "monthly";
                            /**
                             * between(1, 31)
                             * @description a number between 1 and 31
                             */
                            dayOfMonth: components["schemas"]["Int"];
                        } | {
                            /** @enum {string} */
                            type: "yearly";
                            /**
                             * between(1, 12)
                             * @description a number between 1 and 12
                             */
                            month: components["schemas"]["Int"];
                            /**
                             * between(1, 31)
                             * @description a number between 1 and 31
                             */
                            day: components["schemas"]["Int"];
                        } | {
                            /** @enum {string} */
                            type: "custom";
                            /**
                             * between(1, 1000)
                             * @description a number between 1 and 1000
                             */
                            intervalValue: components["schemas"]["Int"];
                            /** @enum {string} */
                            intervalUnit: "days" | "weeks" | "months";
                            /** @description a string matching the pattern ^\d{4}-\d{2}-\d{2}$ */
                            anchorDate: string;
                        };
                        completedThrough: string | null;
                        createdAt: components["schemas"]["DateTimeUtc"];
                        updatedAt: components["schemas"]["DateTimeUtc"];
                        /** @description a string matching the pattern ^\d{4}-\d{2}-\d{2}$ */
                        dueDate: string;
                        overdue: boolean;
                        done: boolean;
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
    "tasks.remove": {
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
            /** @description TaskNotFound */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskNotFound"];
                };
            };
        };
    };
    "tasks.update": {
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
                    description?: string;
                    recurrence?: {
                        /** @enum {string} */
                        type: "once";
                        /** @description a string matching the pattern ^\d{4}-\d{2}-\d{2}$ */
                        date: string;
                    } | {
                        /** @enum {string} */
                        type: "weekly";
                        /**
                         * between(1, 7)
                         * @description a number between 1 and 7
                         */
                        weekday: components["schemas"]["Int"];
                    } | {
                        /** @enum {string} */
                        type: "monthly";
                        /**
                         * between(1, 31)
                         * @description a number between 1 and 31
                         */
                        dayOfMonth: components["schemas"]["Int"];
                    } | {
                        /** @enum {string} */
                        type: "yearly";
                        /**
                         * between(1, 12)
                         * @description a number between 1 and 12
                         */
                        month: components["schemas"]["Int"];
                        /**
                         * between(1, 31)
                         * @description a number between 1 and 31
                         */
                        day: components["schemas"]["Int"];
                    } | {
                        /** @enum {string} */
                        type: "custom";
                        /**
                         * between(1, 1000)
                         * @description a number between 1 and 1000
                         */
                        intervalValue: components["schemas"]["Int"];
                        /** @enum {string} */
                        intervalUnit: "days" | "weeks" | "months";
                        /** @description a string matching the pattern ^\d{4}-\d{2}-\d{2}$ */
                        anchorDate: string;
                    };
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
                         * maxLength(200)
                         * @description a string at most 200 character(s) long
                         */
                        description: string;
                        recurrence: {
                            /** @enum {string} */
                            type: "once";
                            /** @description a string matching the pattern ^\d{4}-\d{2}-\d{2}$ */
                            date: string;
                        } | {
                            /** @enum {string} */
                            type: "weekly";
                            /**
                             * between(1, 7)
                             * @description a number between 1 and 7
                             */
                            weekday: components["schemas"]["Int"];
                        } | {
                            /** @enum {string} */
                            type: "monthly";
                            /**
                             * between(1, 31)
                             * @description a number between 1 and 31
                             */
                            dayOfMonth: components["schemas"]["Int"];
                        } | {
                            /** @enum {string} */
                            type: "yearly";
                            /**
                             * between(1, 12)
                             * @description a number between 1 and 12
                             */
                            month: components["schemas"]["Int"];
                            /**
                             * between(1, 31)
                             * @description a number between 1 and 31
                             */
                            day: components["schemas"]["Int"];
                        } | {
                            /** @enum {string} */
                            type: "custom";
                            /**
                             * between(1, 1000)
                             * @description a number between 1 and 1000
                             */
                            intervalValue: components["schemas"]["Int"];
                            /** @enum {string} */
                            intervalUnit: "days" | "weeks" | "months";
                            /** @description a string matching the pattern ^\d{4}-\d{2}-\d{2}$ */
                            anchorDate: string;
                        };
                        completedThrough: string | null;
                        createdAt: components["schemas"]["DateTimeUtc"];
                        updatedAt: components["schemas"]["DateTimeUtc"];
                        /** @description a string matching the pattern ^\d{4}-\d{2}-\d{2}$ */
                        dueDate: string;
                        overdue: boolean;
                        done: boolean;
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
            /** @description TaskNotFound */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskNotFound"];
                };
            };
        };
    };
    "tasks.complete": {
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
                         * maxLength(200)
                         * @description a string at most 200 character(s) long
                         */
                        description: string;
                        recurrence: {
                            /** @enum {string} */
                            type: "once";
                            /** @description a string matching the pattern ^\d{4}-\d{2}-\d{2}$ */
                            date: string;
                        } | {
                            /** @enum {string} */
                            type: "weekly";
                            /**
                             * between(1, 7)
                             * @description a number between 1 and 7
                             */
                            weekday: components["schemas"]["Int"];
                        } | {
                            /** @enum {string} */
                            type: "monthly";
                            /**
                             * between(1, 31)
                             * @description a number between 1 and 31
                             */
                            dayOfMonth: components["schemas"]["Int"];
                        } | {
                            /** @enum {string} */
                            type: "yearly";
                            /**
                             * between(1, 12)
                             * @description a number between 1 and 12
                             */
                            month: components["schemas"]["Int"];
                            /**
                             * between(1, 31)
                             * @description a number between 1 and 31
                             */
                            day: components["schemas"]["Int"];
                        } | {
                            /** @enum {string} */
                            type: "custom";
                            /**
                             * between(1, 1000)
                             * @description a number between 1 and 1000
                             */
                            intervalValue: components["schemas"]["Int"];
                            /** @enum {string} */
                            intervalUnit: "days" | "weeks" | "months";
                            /** @description a string matching the pattern ^\d{4}-\d{2}-\d{2}$ */
                            anchorDate: string;
                        };
                        completedThrough: string | null;
                        createdAt: components["schemas"]["DateTimeUtc"];
                        updatedAt: components["schemas"]["DateTimeUtc"];
                        /** @description a string matching the pattern ^\d{4}-\d{2}-\d{2}$ */
                        dueDate: string;
                        overdue: boolean;
                        done: boolean;
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
            /** @description TaskNotFound */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskNotFound"];
                };
            };
        };
    };
    "tasks.uncomplete": {
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
                         * maxLength(200)
                         * @description a string at most 200 character(s) long
                         */
                        description: string;
                        recurrence: {
                            /** @enum {string} */
                            type: "once";
                            /** @description a string matching the pattern ^\d{4}-\d{2}-\d{2}$ */
                            date: string;
                        } | {
                            /** @enum {string} */
                            type: "weekly";
                            /**
                             * between(1, 7)
                             * @description a number between 1 and 7
                             */
                            weekday: components["schemas"]["Int"];
                        } | {
                            /** @enum {string} */
                            type: "monthly";
                            /**
                             * between(1, 31)
                             * @description a number between 1 and 31
                             */
                            dayOfMonth: components["schemas"]["Int"];
                        } | {
                            /** @enum {string} */
                            type: "yearly";
                            /**
                             * between(1, 12)
                             * @description a number between 1 and 12
                             */
                            month: components["schemas"]["Int"];
                            /**
                             * between(1, 31)
                             * @description a number between 1 and 31
                             */
                            day: components["schemas"]["Int"];
                        } | {
                            /** @enum {string} */
                            type: "custom";
                            /**
                             * between(1, 1000)
                             * @description a number between 1 and 1000
                             */
                            intervalValue: components["schemas"]["Int"];
                            /** @enum {string} */
                            intervalUnit: "days" | "weeks" | "months";
                            /** @description a string matching the pattern ^\d{4}-\d{2}-\d{2}$ */
                            anchorDate: string;
                        };
                        completedThrough: string | null;
                        createdAt: components["schemas"]["DateTimeUtc"];
                        updatedAt: components["schemas"]["DateTimeUtc"];
                        /** @description a string matching the pattern ^\d{4}-\d{2}-\d{2}$ */
                        dueDate: string;
                        overdue: boolean;
                        done: boolean;
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
            /** @description TaskNotFound */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["TaskNotFound"];
                };
            };
        };
    };
}
