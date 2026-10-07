import { seedData } from "../../data/seedData";
import type { OrvexaData } from "../../interfaces/OrvexaData";

const STORAGE_KEY = "orvexa_data"

export function getData(): OrvexaData {
    const storedData = localStorage.getItem(STORAGE_KEY)

    if (!storedData) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData))
        return seedData
    }

    return JSON.parse(storedData) as OrvexaData
}

export function saveData(data: OrvexaData): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
} 