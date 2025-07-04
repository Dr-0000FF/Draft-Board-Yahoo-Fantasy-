import React from "react";

const positions = ["QB", "RB", "WR", "TE", "FLEX", "K", "DEF"];

function DraftBoard({ teams, assignPlayerToTeam }) {
    return (
        <div className="mb-8 overflow-auto">
            <h2 className="text-xl font-semibold mb-4">Draft Board (Click a slot to assign selected player)</h2>
            <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                    <tr>
                        <th className="border border-gray-300 px-2 py-1">Team</th>
                        {positions.map((pos) => (
                            <th key={pos} className="border border-gray-300 px-2 py-1">{pos}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {teams.length === 0 && (
                        <tr>
                            <td colSpan={positions.length + 1} className="text-center p-4 text-gray-500">
                                No teams added yet
                            </td>
                        </tr>
                    )}
                    {teams.map((team, tIndex) => (
                        <tr key={tIndex} className="text-center">
                            <td className="border border-gray-300 px-2 py-1 font-semibold">{team.name}</td>
                            {positions.map((pos) => (
                                <td
                                    key={pos}
                                    className="border border-gray-300 px-2 py-1 cursor-pointer hover:bg-gray-200"
                                    onClick={() => assignPlayerToTeam(tIndex, pos)}
                                    title={`Assign player to ${team.name} - ${pos}`}
                                >
                                    {team.roster[pos].length === 0
                                        ? "-"
                                        : team.roster[pos].map((p, i) => (
                                            <div key={i} className="text-sm">
                                                {p.name}
                                            </div>
                                        ))}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DraftBoard;
