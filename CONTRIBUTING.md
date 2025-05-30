# Contributing to YouTube Studio Clone

Thank you for your interest in contributing to the YouTube Studio Clone project! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Security](#security)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming environment for everyone.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- A code editor (VS Code recommended)
- Basic knowledge of React, TypeScript, and Tailwind CSS

### Development Setup

1. **Fork the repository**
   ```bash
   # Fork the repo on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/ytastudioaug2.git
   cd ytastudioaug2
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm run test
   ```

## Contributing Guidelines

### Types of Contributions

We welcome various types of contributions:

- **Bug fixes**: Fix existing issues
- **Feature additions**: Add new functionality
- **Documentation**: Improve or add documentation
- **Performance improvements**: Optimize existing code
- **UI/UX enhancements**: Improve user interface and experience
- **Testing**: Add or improve test coverage
- **Accessibility**: Improve accessibility features

### Before You Start

1. **Check existing issues**: Look for existing issues or discussions
2. **Create an issue**: For new features or significant changes, create an issue first
3. **Discuss**: Engage with maintainers and community before starting work

## Pull Request Process

### 1. Create a Branch

```bash
# Create a new branch for your feature/fix
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number
```

### 2. Make Changes

- Follow our [coding standards](#coding-standards)
- Write tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 3. Commit Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Examples:
git commit -m "feat: add video upload functionality"
git commit -m "fix: resolve video player loading issue"
git commit -m "docs: update API documentation"
git commit -m "test: add unit tests for video component"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### 4. Push and Create PR

```bash
git push origin your-branch-name
```

Then create a Pull Request on GitHub with:

- **Clear title**: Descriptive title following conventional commits
- **Detailed description**: What changes were made and why
- **Issue reference**: Link to related issues
- **Screenshots**: For UI changes
- **Testing notes**: How to test the changes

### 5. PR Review Process

- **Automated checks**: Ensure all CI checks pass
- **Code review**: Address feedback from reviewers
- **Testing**: Verify functionality works as expected
- **Documentation**: Update docs if needed

## Coding Standards

### TypeScript

- Use strict TypeScript configuration
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

```typescript
// Good
interface VideoMetadata {
  title: string;
  duration: number;
  thumbnailUrl: string;
}

const formatVideoDuration = (seconds: number): string => {
  // Implementation
};

// Avoid
const data: any = {};
const fn = (x: any) => x;
```

### React Components

- Use functional components with hooks
- Implement proper prop types
- Use meaningful component names
- Keep components focused and reusable

```tsx
// Good
interface VideoCardProps {
  video: Video;
  onPlay: (videoId: string) => void;
  className?: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onPlay, className }) => {
  return (
    <div className={cn('video-card', className)}>
      {/* Component content */}
    </div>
  );
};
```

### Styling

- Use Tailwind CSS utility classes
- Create reusable component classes when needed
- Follow responsive design principles
- Ensure accessibility compliance

```tsx
// Good
<button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Upload Video
</button>
```

### File Organization

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components
│   └── features/       # Feature-specific components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── services/           # API services
├── stores/             # State management
└── assets/             # Static assets
```

## Testing Guidelines

### Unit Tests

- Write tests for all new functionality
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies

```typescript
describe('VideoCard', () => {
  it('should display video title and duration', () => {
    // Arrange
    const mockVideo = {
      id: '1',
      title: 'Test Video',
      duration: 120
    };

    // Act
    render(<VideoCard video={mockVideo} onPlay={jest.fn()} />);

    // Assert
    expect(screen.getByText('Test Video')).toBeInTheDocument();
    expect(screen.getByText('2:00')).toBeInTheDocument();
  });
});
```

### Integration Tests

- Test component interactions
- Test API integrations
- Use MSW for API mocking

### E2E Tests

- Test critical user journeys
- Use Playwright for browser testing
- Focus on happy paths and error scenarios

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Documentation

### Code Documentation

- Add JSDoc comments for complex functions
- Document component props and interfaces
- Include usage examples

```typescript
/**
 * Formats video duration from seconds to MM:SS or HH:MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 * @example
 * formatDuration(125) // returns "2:05"
 * formatDuration(3665) // returns "1:01:05"
 */
const formatDuration = (seconds: number): string => {
  // Implementation
};
```

### README Updates

- Update README.md for new features
- Include setup instructions
- Add usage examples
- Update dependencies list

## Issue Reporting

### Bug Reports

When reporting bugs, include:

- **Clear title**: Brief description of the issue
- **Steps to reproduce**: Detailed steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: Browser, OS, Node.js version
- **Screenshots**: If applicable
- **Console errors**: Any error messages

### Feature Requests

For feature requests, include:

- **Problem description**: What problem does this solve?
- **Proposed solution**: How should it work?
- **Alternatives**: Other solutions considered
- **Use cases**: When would this be used?
- **Mockups**: Visual examples if applicable

## Security

### Reporting Security Issues

- **Do not** create public issues for security vulnerabilities
- Email security issues to: [security@example.com]
- Include detailed description and steps to reproduce
- Allow time for investigation before public disclosure

### Security Best Practices

- Never commit API keys or secrets
- Use environment variables for configuration
- Validate all user inputs
- Follow OWASP security guidelines
- Keep dependencies updated

## Performance Guidelines

### Code Performance

- Use React.memo for expensive components
- Implement proper lazy loading
- Optimize bundle size
- Use efficient algorithms

### Bundle Optimization

- Code splitting for routes
- Tree shaking for unused code
- Optimize images and assets
- Use CDN for static assets

## Accessibility

### Requirements

- Follow WCAG 2.1 AA guidelines
- Ensure keyboard navigation
- Provide proper ARIA labels
- Test with screen readers
- Maintain color contrast ratios

### Testing

```bash
# Run accessibility tests
npm run test:a11y

# Lighthouse accessibility audit
npm run lighthouse
```

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create release PR
4. Tag release after merge
5. Deploy to production

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Discord**: Real-time chat (if available)
- **Email**: Direct contact for sensitive issues

### Resources

- [Project Documentation](./docs/)
- [API Documentation](./docs/api/)
- [Component Library](./docs/components/)
- [Deployment Guide](./docs/deployment/)

## Recognition

We appreciate all contributions! Contributors will be:

- Listed in `CONTRIBUTORS.md`
- Mentioned in release notes
- Invited to contributor events
- Eligible for contributor swag

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to YouTube Studio Clone! Your efforts help make this project better for everyone. 🚀