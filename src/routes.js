import { Database } from "./database.js";
import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";
import dayjs from "dayjs";

const database = new Database();

export const routes = [
    {
        method: "GET",
        path: buildRoutePath("/tasks"),
        handler: (request, response) => {
            const { search } = request.query;

            const tasks = database.select("tasks", search ? {
                title: search,
                description: search
            } : null);

            return response.end(JSON.stringify(tasks))
        }
    },
    {
        method: "POST",
        path: buildRoutePath("/tasks"),
        handler: (request, response) => {
            const { title, description } = request.body;

            if (!title || !description) {
                const message = "Incomplete information. Check the 'title' and 'description' fields"
                response.writeHead(400).write(JSON.stringify(message));
                response.end();
            }

            const task = {
                id: randomUUID(),
                title: title,
                description: description,
                completed_at: null,
                created_at: dayjs(new Date),
                updated_at: dayjs(new Date)
            }

            database.insert("tasks", task);
            return response.writeHead(201).end();
        }
    },
    {
        method: "PUT",
        path: buildRoutePath("/tasks/:id"),
        handler: (request, response) => {
            const { title, description } = request.body;
            const { id } = request.params;

            if (!title || !description) {
                const message = "Incomplete information. Check the 'title' and 'description' fields"
                response.writeHead(400).write(JSON.stringify(message));
                response.end();
            }

            const rowIndex = database.update("tasks", id, {
                 title,
                 description
            });

            if (rowIndex < 0) {
                const message = "ID not found in database"
                response.writeHead(400).write(JSON.stringify(message));
                return response.end();
            }

            return response.writeHead(204).end();
        }
    },
    {
        method: "PATCH",
        path: buildRoutePath("/tasks/:id/complete"),
        handler: (request, response) => {
            const { id } = request.params;

            const rowIndex = database.completeTask("tasks", id);

            if (rowIndex < 0) {
                const message = "ID not found in database"
                response.writeHead(400).write(JSON.stringify(message));
                return response.end();
            }

            return response.writeHead(204).end()
        }
    },
    {
        method: "DELETE",
        path: buildRoutePath("/tasks/:id"),
        handler: (request, response) => {
            const {id} = request.params;

            const rowIndex = database.delete("tasks", id);

            if (rowIndex < 0) {
                const message = "ID not found in database"
                response.writeHead(400).write(JSON.stringify(message));
                return response.end();
            }

            return response.writeHead(204).end();
        }
    }
];