"use client";
import { useState } from "react";
import { createAdminAccount } from "./action";

export function AdminAccountAddForm() {
    const [message, setMessage] = useState<string>("");
    async function onCreate(formData: FormData) {
        const res = await createAdminAccount(formData);
        setMessage(res?.message!);
    }

    return (
        <form id="setupForm" className="space-y-4" action={onCreate}>
            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                >
                    E-mail Address
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                >
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
            <div>
                <label
                    htmlFor="retype-password"
                    className="block text-sm font-medium text-gray-700"
                >
                    Retype Password
                </label>
                <input
                    type="password"
                    id="retype-password"
                    name="retype-password"
                    required
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
            </div>
            <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                Next
            </button>
            <p>{message}</p>
        </form>
    );
}
