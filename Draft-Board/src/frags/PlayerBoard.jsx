import React, { useState, useEffect } from "react";

function PlayerPool({ players, selectedPlayerIndex, setSelectedPlayerIndex, onSearch }) {
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            onSearch(searchTerm.trim());
        }, 400);

        return () => clearTimeout(handler);
    }, [searchTerm, onSearch]);

    return (
        <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Available Players (Click to Select)</h2>
            <input
                type="text"
                placeholder="Search players..."
                className="border p-2 mb-2 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul className="border rounded p-2 max-h-64 overflow-auto grid grid-cols-6 gap-2 text-sm">
                <li className="font-bold">Name</li>
                <li className="font-bold">Position</li>
                <li className="font-bold">Team</li>
                <li className="font-bold">Bye Week</li>
                <li className="font-bold">Overall Rank</li>
                <li className="font-bold">Actual Rank</li>

                {players.length === 0 && (
                    <li className="col-span-6 text-center text-gray-500">No players available</li>
                )}

                {players.map((player, i) => (
                    <React.Fragment key={player.id || i}>
                        <li
                            className={`p-1 cursor-pointer rounded ${selectedPlayerIndex === i ? "bg-blue-200" : "hover:bg-gray-100"}`}
                            onClick={() => setSelectedPlayerIndex(i)}
                        >
                            {player.name}
                        </li>
                        <li
                            className={`p-1 cursor-pointer rounded ${selectedPlayerIndex === i ? "bg-blue-200" : "hover:bg-gray-100"}`}
                            onClick={() => setSelectedPlayerIndex(i)}
                        >
                            {player.position}
                        </li>
                        <li
                            className={`p-1 cursor-pointer rounded ${selectedPlayerIndex === i ? "bg-blue-200" : "hover:bg-gray-100"}`}
                            onClick={() => setSelectedPlayerIndex(i)}
                        >
                            {player.team}
                        </li>
                        <li
                            className={`p-1 cursor-pointer rounded ${selectedPlayerIndex === i ? "bg-blue-200" : "hover:bg-gray-100"}`}
                            onClick={() => setSelectedPlayerIndex(i)}
                        >
                            {player.byeWeek}
                        </li>
                        <li
                            className={`p-1 cursor-pointer rounded ${selectedPlayerIndex === i ? "bg-blue-200" : "hover:bg-gray-100"}`}
                            onClick={() => setSelectedPlayerIndex(i)}
                        >
                            {player.OR ?? "—"}
                        </li>
                        <li
                            className={`p-1 cursor-pointer rounded ${selectedPlayerIndex === i ? "bg-blue-200" : "hover:bg-gray-100"}`}
                            onClick={() => setSelectedPlayerIndex(i)}
                        >
                            {player.AR ?? "—"}
                        </li>
                    </React.Fragment>
                ))}
            </ul>
        </div>
    );
}

export default PlayerPool;
