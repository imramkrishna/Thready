# Contributing to Thready

Thank you for considering contributing to Thready! 🎉

## How to Contribute

### Reporting Bugs

If you find a bug, please open an issue with:
- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Node version, browser)

### Suggesting Features

Feature requests are welcome! Please:
- Check if the feature already exists
- Explain the use case
- Describe the proposed API

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Add tests if applicable
5. Run `npm run build` to ensure it builds
6. Commit with clear messages
7. Push and create a pull request

### Development Setup

```bash
# Clone the repo
git clone https://github.com/imramkrishna/Thready.git
cd Thready

# Install dependencies
npm install

# Build
npm run build

# Test your changes
npm link
cd ../test-project
npm link thready
```

### Code Style

- Use TypeScript
- Follow existing code style
- Add JSDoc comments for public APIs
- Keep functions focused and single-purpose

### Commit Messages

Use clear, descriptive commit messages:
- `feat: add task prioritization`
- `fix: resolve worker memory leak`
- `docs: update README examples`
- `refactor: improve queue management`

## Code of Conduct

Be respectful and constructive. We're all here to learn and improve!

## Questions?

Open an issue or reach out to the maintainers.

Thank you for contributing! 🙏
