import React from "react";

const positions = ["QB", "RB", "WR", "TE", "FLEX", "K", "DEF"];

function PlayerForm({ playerInput, setPlayerInput, handleAddPlayer }) {
    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Add Player</h2>
            <input
                className="border p-2 mr-2"
                value={playerInput.name}
                onChange={(e) => setPlayerInput({ ...playerInput, name: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleAddPlayer()}
                placeholder="Player name"
            />
            <select
                className="border p-2 mr-2"
                value={playerInput.position}
                onChange={(e) => setPlayerInput({ ...playerInput, position: e.target.value })}
            >
                {positions.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                ))}
            </select>
            <button onClick={handleAddPlayer} className="bg-green-500 text-white px-4 py-2 rounded">
                Add Player
            </button>
        </div>
    );
}

export default PlayerForm;
