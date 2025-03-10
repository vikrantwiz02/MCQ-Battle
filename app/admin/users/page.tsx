import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/user"
import { formatDistanceToNow } from "date-fns"

async function getUsers() {
  await connectToDatabase()

  const users = await User.find().sort({ createdAt: -1 })

  return users.map((user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    totalGames: user.totalGames,
    wins: user.wins,
    losses: user.losses,
    draws: user.draws,
    createdAt: user.createdAt,
  }))
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Users</h1>

      <Card className="bg-blue-800/20 border-blue-700 text-white">
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blue-700">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Games</th>
                  <th className="text-left py-3 px-4">Win/Loss</th>
                  <th className="text-left py-3 px-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-blue-800 hover:bg-blue-800/30">
                    <td className="py-3 px-4">{user.name}</td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      {user.isAdmin ? (
                        <Badge className="bg-purple-700">Admin</Badge>
                      ) : (
                        <Badge className="bg-blue-700">User</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">{user.totalGames}</td>
                    <td className="py-3 px-4">
                      <span className="text-green-400">{user.wins}</span> /{" "}
                      <span className="text-red-400">{user.losses}</span>
                      {user.draws > 0 && <span className="text-yellow-400"> ({user.draws} draws)</span>}
                    </td>
                    <td className="py-3 px-4 text-sm text-blue-300">
                      {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-blue-300">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

