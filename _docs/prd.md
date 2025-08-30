# Product Requirements Document: Brunnr Frontend

## 1. Executive Summary

Brunnr Frontend is a lightweight, intuitive web application that provides a streamlined interface for generating educational videos using the Brunnr Service API. Unlike the previous complex implementation, this frontend focuses on simplicity, direct API interaction, and an optimal user experience for video creation.

## 2. Product Vision

### Mission Statement
To democratize educational video creation by providing the simplest possible interface for transforming questions and concepts into engaging, animated educational videos.

### Core Principles
- **Simplicity First**: Every feature must justify its complexity
- **Direct API Integration**: Leverage the API's capabilities without recreating infrastructure
- **User-Focused Design**: Optimize for the end user's video creation journey
- **Transparent Process**: Show users what's happening without overwhelming them

## 3. Target Users

### Primary Users
1. **Educators**
   - Teachers creating supplementary material
   - Online course creators
   - Tutorial makers
   - Need: Quick, professional educational videos without technical expertise

2. **Students**
   - Self-learners seeking visual explanations
   - Content creators in educational spaces
   - Need: Transform complex topics into understandable videos

3. **Content Creators**
   - YouTube educators
   - Social media educational content creators
   - Need: Rapid video generation with customization options

### User Personas

**Sarah the Science Teacher**
- Needs to explain complex concepts visually
- Limited time for content creation
- Values accuracy and clarity
- Technical comfort: Medium

**Alex the Self-Learner**
- Studying advanced mathematics independently
- Wants personalized explanations
- Values depth and customization
- Technical comfort: High

**Maya the Content Creator**
- Creates educational TikToks
- Needs quick turnaround
- Values engagement and visual appeal
- Technical comfort: Medium-High

## 4. Core User Journeys

### Journey 1: Quick Video Generation
1. User enters a question or topic
2. Optionally provides context (audience level, style preferences)
3. Clicks generate
4. Reviews the generated video
5. Downloads or shares the result

### Journey 2: Custom Manifest Creation
1. User starts with a question
2. Reviews and edits the generated explanation
3. Modifies the screenplay structure
4. Adjusts the manifest (templates, animations)
5. Generates video from custom manifest
6. Downloads final result

### Journey 3: Video Analysis & Iteration
1. User uploads or creates a manifest
2. Reviews timing analytics
3. Makes adjustments based on recommendations
4. Regenerates specific portions
5. Exports optimized video

## 5. Functional Requirements

### 5.1 Core Features

#### F1: Video Generation from Questions
- **Description**: Primary interface for creating videos from text input
- **Capabilities**:
  - Text input field for questions/topics
  - Context field for audience/style specification
  - Progress indicator during generation
  - Video preview player
  - Download options (MP4)
- **API Endpoints**: 
  - `POST /media/question-to-video`
  - `GET /media/videos/{request_id}/{filename}`

#### F2: Step-by-Step Pipeline Control
- **Description**: Advanced mode for users who want more control
- **Capabilities**:
  - Question → Explanation editing
  - Explanation → Screenplay review/edit
  - Screenplay → Manifest customization
  - Manifest → Video generation
- **API Endpoints**:
  - `POST /content/question-to-explanation`
  - `POST /content/explanation-to-screenplay`
  - `POST /content/screenplay-to-manifest`
  - `POST /media/manifest-to-video`

#### F3: Manifest Editor
- **Description**: Visual editor for video manifests
- **Capabilities**:
  - Template management (Text, MathTex, shapes)
  - Shot sequencing
  - Animation timeline
  - Voiceover text editing
  - Preview individual shots
- **API Endpoints**:
  - `POST /media/manifest-to-video`
  - `POST /media/manifest-to-silent-video`

#### F4: Analytics Dashboard
- **Description**: Timing and pacing analysis tools
- **Capabilities**:
  - Audio timing visualization
  - Video pacing analysis
  - Shot duration recommendations
  - Export timing data
- **API Endpoints**:
  - `POST /analytics/audio-timing`
  - `POST /analytics/video-timing`
  - `POST /analytics/timing-visualization`

#### F5: Transcript Tools
- **Description**: Extract and manage video transcripts
- **Capabilities**:
  - Extract transcript from manifest
  - Display word count and timing
  - Export as text file
  - Search within transcript
- **API Endpoints**:
  - `POST /media/audio/transcript`

### 5.2 User Interface Components

#### UI1: Main Dashboard
- **Components**:
  - Quick generation card
  - Recent videos gallery
  - Template library
  - API health status indicator

#### UI2: Generation Wizard
- **Components**:
  - Multi-step form
  - Real-time preview panels
  - Progress indicators
  - Error recovery options

#### UI3: Manifest Visualizer
- **Components**:
  - Timeline view
  - Template palette
  - Property inspector
  - Animation preview

#### UI4: Video Player
- **Components**:
  - Custom controls
  - Shot navigation
  - Timestamp display
  - Download options

### 5.3 Non-Functional Requirements

#### Performance
- API response handling under 100ms
- Video generation progress updates every 2 seconds
- Support for videos up to 10 minutes
- Responsive design for mobile devices

#### Security
- Secure API key management
- HTTPS only communication
- Input sanitization
- Rate limiting compliance

#### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- High contrast mode

#### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 6. Technical Architecture

### 6.1 Technology Stack
- **Frontend Framework**: React 18+ with TypeScript
- **UI Library**: Tailwind CSS + Radix UI/Shadcn
- **State Management**: Zustand or Context API
- **API Client**: Axios with interceptors
- **Video Player**: Video.js or native HTML5
- **Build Tool**: Vite
- **Deployment**: Vercel/Netlify

### 6.2 Key Technical Decisions
1. **Client-Side Only**: No backend required, direct API communication
2. **Progressive Enhancement**: Core features work without JavaScript
3. **Optimistic UI**: Show expected states during API calls
4. **Error Boundaries**: Graceful degradation for failures
5. **API Key Storage**: Secure client-side storage with encryption

### 6.3 Data Flow
```
User Input → API Request → Response Processing → UI Update
     ↓                           ↓
Error Handling            Progress Updates
     ↓                           ↓
Retry/Recovery            Real-time Feedback
```

## 7. Design Guidelines

### 7.1 Visual Design Principles
- **Clean & Minimal**: Focus on content, not chrome
- **Educational Aesthetic**: Professional but approachable
- **Consistent Spacing**: 8px grid system
- **Limited Color Palette**: Primary, secondary, success, error
- **Typography**: Clear hierarchy, readable at all sizes

### 7.2 Interaction Patterns
- **Progressive Disclosure**: Show advanced options only when needed
- **Immediate Feedback**: Every action has a response
- **Forgiving Inputs**: Smart parsing and error correction
- **Contextual Help**: Tooltips and inline guidance

### 7.3 Responsive Behavior
- **Mobile First**: Core features work on phones
- **Tablet Optimization**: Better use of screen space
- **Desktop Enhancement**: Multi-panel layouts
- **Fluid Typography**: Scale based on viewport

## 8. Success Metrics

### 8.1 User Success Metrics
- **Time to First Video**: < 2 minutes for new users
- **Video Generation Success Rate**: > 95%
- **User Satisfaction Score**: > 4.5/5
- **Feature Adoption**: 60% use advanced features
- **Return Rate**: 70% weekly active users

### 8.2 Technical Metrics
- **Page Load Time**: < 2 seconds
- **API Error Rate**: < 0.1%
- **Uptime**: 99.9%
- **Mobile Performance Score**: > 90/100

### 8.3 Business Metrics
- **User Acquisition Cost**: Track and optimize
- **API Usage Efficiency**: Minimize unnecessary calls
- **User Retention**: 30-day retention > 40%
- **Feature Usage**: Track most/least used features

## 9. MVP Definition

### 9.1 MVP Features (Phase 1)
1. **Quick Video Generation**
   - Single question input
   - Basic context options
   - Video preview and download
   
2. **Simple Manifest Editor**
   - View generated manifest
   - Basic text editing
   - Regenerate video

3. **Video History**
   - Last 10 videos
   - Re-download capability
   - Basic search

### 9.2 Post-MVP Features (Phase 2)
1. **Advanced Pipeline Control**
   - Step-by-step editing
   - Save/load workflows
   - Template library

2. **Analytics Integration**
   - Timing visualization
   - Optimization suggestions
   - A/B testing support

3. **Collaboration Features**
   - Share manifests
   - Public video gallery
   - Embed codes

### 9.3 Future Considerations (Phase 3)
1. **AI Enhancements**
   - Style transfer
   - Voice cloning
   - Multi-language support

2. **Platform Integration**
   - YouTube upload
   - Social media optimization
   - LMS integration

## 10. Constraints & Assumptions

### 10.1 Constraints
- **API Limitations**: Must work within API rate limits
- **Browser Capabilities**: No native app features
- **Video Size**: Limited by browser memory
- **Processing Time**: Dependent on API performance

### 10.2 Assumptions
- Users have stable internet connections
- API maintains backward compatibility
- Video generation times remain under 60 seconds
- Users are comfortable with web applications

## 11. Risks & Mitigation

### 11.1 Technical Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| API Downtime | High | Implement retry logic, show status |
| Browser Compatibility | Medium | Progressive enhancement |
| Large Video Handling | Medium | Streaming download support |
| API Key Security | High | Encrypted storage, rotation reminders |

### 11.2 User Experience Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex UI | High | User testing, iterative design |
| Long Generation Times | Medium | Progress indicators, expectations |
| Error Messages | Medium | User-friendly error handling |
| Feature Discovery | Low | Onboarding, tooltips |

## 12. Timeline & Milestones

### 12.1 Development Phases
1. **Phase 0: Setup** (Week 1)
   - Project setup
   - API integration framework
   - Basic UI components

2. **Phase 1: MVP** (Weeks 2-4)
   - Quick generation
   - Basic manifest editor
   - Video player

3. **Phase 2: Enhancement** (Weeks 5-6)
   - Advanced features
   - Analytics integration
   - Polish and optimization

4. **Phase 3: Launch** (Week 7)
   - Testing and bug fixes
   - Documentation
   - Deployment

### 12.2 Success Criteria for Launch
- [ ] Core features functional
- [ ] < 2 second load time
- [ ] Mobile responsive
- [ ] Error handling complete
- [ ] User documentation ready
- [ ] Analytics tracking active

## 13. Open Questions

1. **API Key Management**: How should users manage their API keys?
2. **Video Storage**: Should we cache generated videos?
3. **Manifest Templates**: Pre-built templates vs. user-created?
4. **Pricing Model**: How to handle API costs?
5. **User Accounts**: Anonymous use vs. registration?

## 14. Appendices

### A. API Endpoint Reference
See [api-reference.md](./api-reference.md) for complete endpoint documentation.

### B. Competitor Analysis
- **Manim Community**: Command-line focused, technical users
- **Remotion**: Code-based video generation
- **Synthesia**: AI avatars, different use case
- **Our Advantage**: Simplest educational video creation

### C. Technical Specifications
- Response time requirements
- Browser storage limits
- Video codec support
- API rate limits

---

**Document Version**: 1.0.0  
**Last Updated**: January 2025  
**Status**: In Review  
**Owner**: Brunnr Frontend Team
