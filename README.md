# Schema0 - Database Schema Visualizer

A modern, interactive database schema visualization tool built with Next.js, React Flow, and Drizzle ORM. Schema0 allows you to upload your PostgreSQL databases and visualize their structure with an intuitive, interactive interface.

![Schema0 Demo](public/demo.mp4)

## ✨ Features

- **Interactive Schema Visualization**: View your database tables and relationships in an intuitive flow diagram
- **Real-time Database Connection**: Connect to your PostgreSQL databases using connection strings
- **Multi-Schema Support**: Navigate between different schemas in your database
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Full-Screen Mode**: Immersive viewing experience for complex schemas
- **Mini Map Navigation**: Easy navigation through large schema diagrams
- **Modern UI**: Built with Radix UI components and Tailwind CSS
- **Authentication**: Secure user authentication with Better Auth
- **Database Management**: Upload, manage, and rename your databases

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/schema0.git
   cd schema0
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory based on `.env.example`

4. **Run database migrations**
   ```bash
   npx drizzle-kit migrate
   ```

5. **Start the development server**
   ```bash
   bun run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Radix UI, Tailwind CSS, Lucide React
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Visualization**: React Flow (@xyflow/react)
- **Authentication**: Better Auth
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS with Motion animations
- **Code Quality**: Biome for linting and formatting

## 📖 Usage

### Adding a Database

1. Click the "+" button in the top navigation
2. Enter your PostgreSQL connection string
3. Your database schema will be automatically analyzed and visualized

### Connection String Format

```
postgresql://username:password@hostname:port/database_name
```

Example:
```
postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/dbname
```

### Navigating the Schema

- **Zoom**: Use mouse wheel or pinch gestures
- **Pan**: Click and drag to move around
- **Full Screen**: Click the full-screen button for immersive viewing
- **Mini Map**: Use the mini map for quick navigation
- **Schema Selection**: Switch between different schemas using the dropdown

## 🏗️ Project Structure

```
schema0/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   │   ├── schema-visualizer/  # Schema visualization logic
│   │   └── ui/             # Reusable UI components
│   ├── lib/                # Utility functions and configurations
│   │   └── db/             # Database utilities and types
│   ├── actions/            # Server actions
│   └── hooks/              # Custom React hooks
├── drizzle/                # Database migrations
└── public/                 # Static assets
```

## 🔧 Development

### Available Scripts

- `bun run dev` - Start development server with Turbopack
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run biome:check` - Run Biome for code formatting
- `bun run db:generate` - Generate database migrations
- `bun run db:migrate` - Run database migrations

### Database Schema

The application uses Drizzle ORM with the following main schemas:
- **auth**: User authentication and session management
- **database**: Database connection management and metadata

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React Flow](https://reactflow.dev/) for the interactive flow diagrams
- [Drizzle ORM](https://orm.drizzle.team/) for database management
- [Better Auth](https://better-auth.com/) for authentication
- [Radix UI](https://www.radix-ui.com/) for accessible UI components

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or reach out to the maintainers.

---

Built with ❤️ using Next.js and React Flow
