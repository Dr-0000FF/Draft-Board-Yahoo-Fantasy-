import React from "react";

function PlayerPool({ players, selectedPlayerIndex, setSelectedPlayerIndex }) {
    return (
        <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Available Players (Click to Select)</h2>
            <ul className="border rounded p-2 max-h-48 overflow-auto">
                {players.map((player, i) => (
                    <li
                        key={i}
                        className={`p-1 cursor-pointer rounded ${selectedPlayerIndex === i ? "bg-blue-200" : "hover:bg-gray-100"}`}
                        onClick={() => setSelectedPlayerIndex(i)}
                    >
                        {player.name} ({player.position})
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default PlayerPool;
