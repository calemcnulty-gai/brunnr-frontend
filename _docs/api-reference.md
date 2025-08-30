# Brunnr Service API Reference

This document provides a complete reference for developers interacting with the Brunnr Service API. The API generates educational videos using Manim (Mathematical Animation Engine) through a sophisticated content pipeline.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [API Endpoints](#api-endpoints)
  - [System Endpoints](#system-endpoints)
  - [Content Generation Pipeline](#content-generation-pipeline)
  - [Media Production Pipeline](#media-production-pipeline)
  - [Analytics Endpoints](#analytics-endpoints)
- [Data Models](#data-models)
- [Workflow Examples](#workflow-examples)
- [Best Practices](#best-practices)

## Overview

The Brunnr Service API transforms educational questions into animated videos through a multi-phase pipeline:

1. **Content Generation**: Question → Explanation → Screenplay → Manifest
2. **Media Production**: Manifest → Audio + Video → Final Output
3. **Analytics**: Timing analysis and visualization

### Key Concepts

- **Manifest**: A JSON structure defining video shots, animations, and timing
- **Shot**: A video segment with optional voiceover and animations
- **Template**: Reusable visual elements (text, math formulas, shapes)
- **Action**: Animations applied to templates (fade in, morph, highlight, etc.)

## Authentication

All endpoints except `/health` require API key authentication.

### Headers
```
X-API-Key: your-api-key-here
```

### Example Request
```bash
curl -X POST https://api.brunnr.ai/content/question-to-explanation \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{"text": "What is statistics?"}'
```

## Base URL

Production: `https://brunnr-service-production.up.railway.app`

Local Development: `http://localhost:8000`

## Error Handling

### Error Response Format
```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (missing/invalid API key)
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

Currently no rate limiting is enforced, but please be considerate of API usage.

## API Endpoints

### System Endpoints

#### Health Check
```
GET /health
```

Check service status and configuration.

**Response:**
```json
{
  "status": "healthy",
  "service": "manim-service",
  "llm_provider": "openai",
  "openai_configured": true,
  "anthropic_configured": false,
  "elevenlabs_configured": true
}
```

### Content Generation Pipeline

#### 1. Question to Explanation
```
POST /content/question-to-explanation
```

Transform a question into a detailed educational explanation.

**Request Body:**
```json
{
  "text": "What is the central limit theorem?",
  "context": "Explain for undergraduate statistics students"
}
```

**Response:**
```json
{
  "status": "completed",
  "message": "Explanation generated successfully",
  "metadata": {
    "request_id": "20240115_143022_question_to_explanation_central_limit",
    "timestamp": "2024-01-15T14:30:22.123Z",
    "client_ip": "192.168.1.1",
    "processing_time": 2.45,
    "log_file_path": "artifacts/20240115_143022_question_to_explanation_central_limit/log.txt"
  },
  "explanation": "The central limit theorem is one of the most important concepts in statistics. It states that when you take many samples from any distribution and calculate their means, those sample means will form a normal distribution...",
  "content_metrics": {
    "word_count": 245,
    "character_count": 1523,
    "line_count": 4,
    "estimated_reading_time_seconds": 98.0
  },
  "llm_provider": {
    "provider": "openai",
    "model": "gpt-4",
    "api_version": "v1"
  }
}
```

#### 2. Explanation to Screenplay
```
POST /content/explanation-to-screenplay
```

Convert an explanation into a structured video screenplay.

**Request Body:**
```json
{
  "text": "The central limit theorem is one of the most important concepts..."
}
```

**Response:**
```json
{
  "status": "completed",
  "message": "Screenplay generated successfully",
  "metadata": {...},
  "screenplay": {
    "shotgroups": [
      {
        "description": "Introduction to the central limit theorem",
        "shots": [
          {
            "description": "Title card showing 'Central Limit Theorem' with animated bell curve",
            "voiceover": "The central limit theorem is one of the most important concepts in statistics."
          },
          {
            "description": "Visual showing multiple sample distributions converging to normal",
            "voiceover": "It states that when you take many samples from any distribution..."
          }
        ]
      }
    ]
  },
  "structure_stats": {
    "scene_count": 3,
    "shot_count": 8,
    "total_voiceover_words": 245
  }
}
```

#### 3. Screenplay to Manifest
```
POST /content/screenplay-to-manifest
```

Convert a screenplay into a renderer-ready manifest.

**Request Body:**
```json
{
  "shotgroups": [
    {
      "description": "Introduction to CLT",
      "shots": [...]
    }
  ]
}
```

**Response:**
```json
{
  "status": "completed",
  "message": "Manifest generated successfully",
  "metadata": {...},
  "manifest": {
    "video_id": "central_limit_theorem_demo",
    "templates": [
      {
        "id": "title_text",
        "type": "Text",
        "content": "Central Limit Theorem"
      },
      {
        "id": "formula_clt",
        "type": "MathTex_term",
        "content": "\\bar{X} \\sim N(\\mu, \\frac{\\sigma^2}{n})"
      }
    ],
    "shots": [
      {
        "voiceover": "The central limit theorem is one of the most important concepts in statistics.",
        "actions": [
          {
            "fade_in": {
              "instance_id": "title_instance",
              "template": "title_text",
              "position": {"below": "TOP", "spacing": 2.0}
            }
          }
        ]
      }
    ]
  }
}
```

#### 4. Question to Manifest (Complete Pipeline)
```
POST /content/question-to-manifest
```

Run the complete content pipeline in one request.

**Request Body:**
```json
{
  "text": "What is the Pythagorean theorem?",
  "context": "For high school geometry students"
}
```

**Response:**
```json
{
  "status": "completed",
  "message": "Complete pipeline executed successfully",
  "metadata": {...},
  "manifest": {...},
  "phase_results": {
    "explanation": "The Pythagorean theorem states that...",
    "explanation_metrics": {...},
    "screenplay": "{\"shotgroups\": [...]}",
    "screenplay_metrics": {...},
    "manifest": {...},
    "manifest_stats": {...}
  }
}
```

### Media Production Pipeline

#### 1. Question to Video (Complete Pipeline)
```
POST /media/question-to-video
```

Generate a complete video from a question.

**Request Body:**
```json
{
  "text": "What is photosynthesis?",
  "context": "Explain for middle school students"
}
```

**Response:**
```json
{
  "status": "completed",
  "message": "Video generated successfully from question",
  "metadata": {
    "request_id": "20240115_150000_question_to_video_photosynthesis",
    "processing_time": 45.2
  },
  "video_path": "artifacts/20240115_150000_question_to_video_photosynthesis/photosynthesis_final.mp4",
  "download_url": "/media/videos/20240115_150000_question_to_video_photosynthesis/photosynthesis_final.mp4",
  "video_id": "photosynthesis_demo",
  "processing_phases": [
    {
      "phase_name": "content_generation",
      "duration_seconds": 5.2,
      "status": "completed"
    },
    {
      "phase_name": "audio_generation",
      "duration_seconds": 8.5,
      "status": "completed"
    },
    {
      "phase_name": "video_rendering",
      "duration_seconds": 30.1,
      "status": "completed"
    }
  ],
  "total_processing_time": 45.2
}
```

#### 2. Manifest to Video
```
POST /media/manifest-to-video
```

Generate a video with audio from a manifest.

**Request Body:**
```json
{
  "video_id": "my_educational_video",
  "templates": [...],
  "shots": [...]
}
```

**Response:**
```json
{
  "status": "completed",
  "video_path": "artifacts/.../video_final.mp4",
  "download_url": "/media/videos/.../video_final.mp4",
  "message": "Video generated successfully from manifest",
  "metadata": {...}
}
```

#### 3. Manifest to Silent Video
```
POST /media/manifest-to-silent-video
```

Generate a video without audio (faster, no TTS costs).

**Request/Response:** Similar to manifest-to-video but without audio processing.

#### 4. Download Video
```
GET /media/videos/{request_id}/{filename}
```

Download generated video files.

**Example:**
```
GET /media/videos/20240115_150000_question_to_video_photosynthesis/photosynthesis_final.mp4
```

#### 5. Extract Transcript
```
POST /media/audio/transcript
```

Extract voiceover transcript from a manifest.

**Request Body:**
```json
{
  "video_id": "demo",
  "templates": [...],
  "shots": [...]
}
```

**Response:**
```json
{
  "transcript": "This is the complete voiceover text extracted from all shots...",
  "transcript_metadata": {
    "word_count": 150,
    "character_count": 892,
    "estimated_speaking_time_seconds": 60.0,
    "language": "en"
  },
  "source_shots_count": 5,
  "extraction_method": "manifest_voiceover_concatenation"
}
```

### Analytics Endpoints

#### 1. Audio Timing Analysis
```
POST /analytics/audio-timing
```

Analyze how audio is spliced and timed for video synchronization.

**Request Body:** A manifest object

**Response:**
```json
{
  "total_duration": 45.5,
  "total_words": 120,
  "shot_count": 8,
  "splice_points": [
    {
      "time": 0.0,
      "type": "audio_start",
      "shot_index": 0
    },
    {
      "time": 5.2,
      "type": "silence_start",
      "shot_index": 1
    }
  ],
  "shots": [
    {
      "shot_index": 0,
      "voiceover": "Introduction text...",
      "word_count": 15,
      "has_timing": true,
      "start_time": 0.0,
      "end_time": 5.2,
      "duration": 5.2,
      "is_silent": false,
      "can_bleed_over": false
    }
  ],
  "warnings": [],
  "recommendations": [
    "Consider adding silence between shots 3 and 4 for better pacing"
  ]
}
```

#### 2. Video Timing Analysis
```
POST /analytics/video-timing
```

Analyze video timing adjustments based on audio constraints.

**Response includes:**
- Shot duration adjustments
- Action timing constraints
- Voiceover bleed-over effects
- Optimization suggestions

#### 3. Timing Visualization
```
POST /analytics/timing-visualization
```

Generate visual timeline representation of shot timing.

**Response:**
```json
{
  "format": "timeline_data",
  "total_duration": 60.0,
  "timeline": [
    {
      "shot_id": "shot_0",
      "start": 0.0,
      "end": 5.2,
      "duration": 5.2,
      "has_voiceover": true,
      "action_count": 2
    }
  ],
  "visualization_type": "timeline",
  "export_formats_available": ["svg", "png", "json"]
}
```

## Data Models

### Shot Types

The API supports four types of shots based on the presence of actions, voiceover, and duration:

1. **Silent Still Shot (SSS)**
   - No actions, no voiceover, explicit duration
   - Example: `{"actions": [], "voiceover": "", "duration": 2.0}`

2. **Voiceover Still Shot (VSS)**
   - No actions, has voiceover, duration calculated from audio
   - Example: `{"actions": [], "voiceover": "This is narration"}`

3. **Silent Action Shot (SAS)**
   - Has actions, no voiceover, duration from action timing
   - Can accept voiceover bleed-over with `allow_bleed_over: true`
   - Example: `{"actions": [...], "voiceover": "", "allow_bleed_over": true}`

4. **Voiceover Action Shot (VAS)**
   - Has both actions and voiceover
   - Can contain voiceover with `contained: true`
   - Example: `{"actions": [...], "voiceover": "Text", "contained": false}`

### Valid Template Types

```
Text, MathTex_term, MathTex_aligned, circle_set, circle,
concentric_inner_circles, under_bracket, over_bracket,
up_arrow, down_arrow, up_down_arrow, left_bracket,
right_bracket, left_arrow, right_arrow, implies,
implied_by, in, ni, not_in, not_ni, left_right_arrow
```

### Valid Action Types

```
fade_in, fade_out, screen_wipe, highlight, fleeting_arrow,
reparent, translate, morph, reorder, custom_object_animation
```

### Action Examples

**Fade In:**
```json
{
  "fade_in": {
    "instance_id": "text_1",
    "template": "title_text",
    "position": {"below": "TOP", "spacing": 2.0}
  }
}
```

**Morph:**
```json
{
  "morph": {
    "from": "equation_1",
    "to_template": "equation_2"
  }
}
```

**Highlight:**
```json
{
  "highlight": {
    "instance_id": "formula_1",
    "index_of_line": 0,
    "index_of_term": 2
  }
}
```

## Workflow Examples

### Example 1: Complete Video Generation

```python
import requests
import json

API_KEY = "your-api-key"
BASE_URL = "https://brunnr-service-production.up.railway.app"

headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json"
}

# Generate video from question
question_data = {
    "text": "What is the quadratic formula?",
    "context": "For algebra students"
}

response = requests.post(
    f"{BASE_URL}/media/question-to-video",
    headers=headers,
    json=question_data
)

if response.status_code == 200:
    result = response.json()
    video_url = BASE_URL + result["download_url"]
    print(f"Video ready: {video_url}")
else:
    print(f"Error: {response.status_code} - {response.text}")
```

### Example 2: Step-by-Step Pipeline

```python
# Step 1: Generate explanation
explanation_response = requests.post(
    f"{BASE_URL}/content/question-to-explanation",
    headers=headers,
    json={"text": "What is photosynthesis?"}
)
explanation = explanation_response.json()["explanation"]

# Step 2: Create screenplay
screenplay_response = requests.post(
    f"{BASE_URL}/content/explanation-to-screenplay",
    headers=headers,
    json={"text": explanation}
)
screenplay = screenplay_response.json()["screenplay"]

# Step 3: Generate manifest
manifest_response = requests.post(
    f"{BASE_URL}/content/screenplay-to-manifest",
    headers=headers,
    json=screenplay
)
manifest = manifest_response.json()["manifest"]

# Step 4: Create video
video_response = requests.post(
    f"{BASE_URL}/media/manifest-to-video",
    headers=headers,
    json=manifest
)
video_url = video_response.json()["download_url"]
```

### Example 3: Custom Manifest Creation

```python
# Create a custom educational video manifest
custom_manifest = {
    "video_id": "custom_math_demo",
    "templates": [
        {
            "id": "title",
            "type": "Text",
            "content": "Pythagorean Theorem"
        },
        {
            "id": "formula",
            "type": "MathTex_term",
            "content": "a^2 + b^2 = c^2"
        },
        {
            "id": "triangle",
            "type": "triangle_right",
            "labels": ["a", "b", "c"]
        }
    ],
    "shots": [
        {
            "voiceover": "The Pythagorean theorem relates the sides of a right triangle.",
            "actions": [
                {
                    "fade_in": {
                        "instance_id": "title_1",
                        "template": "title",
                        "position": {"below": "TOP", "spacing": 2}
                    }
                }
            ]
        },
        {
            "voiceover": "It states that a squared plus b squared equals c squared.",
            "actions": [
                {
                    "fade_in": {
                        "instance_id": "formula_1",
                        "template": "formula",
                        "position": {"below": "title_1", "spacing": 1}
                    }
                },
                {
                    "highlight": {
                        "instance_id": "formula_1"
                    }
                }
            ]
        },
        {
            "voiceover": "",
            "actions": [
                {
                    "fade_in": {
                        "instance_id": "triangle_1",
                        "template": "triangle",
                        "position": {"below": "formula_1", "spacing": 1.5}
                    }
                }
            ],
            "allow_bleed_over": true
        }
    ]
}

# Generate video from custom manifest
response = requests.post(
    f"{BASE_URL}/media/manifest-to-video",
    headers=headers,
    json=custom_manifest
)
```

## Best Practices

### 1. Request IDs and Logging

Every request generates a unique request ID following the pattern:
```
{YYYYMMDD}_{HHMMSS}_{operation}_{content_summary}
```

Access logs and intermediate files at:
```
artifacts/{request_id}/
├── log.txt              # Detailed processing log
├── input_*.json         # Request data
├── output_*.json        # Response data
├── phase_*_result.*     # Intermediate results
└── error.json           # Error details (if failed)
```

### 2. Error Recovery

- Save request IDs for debugging
- Check intermediate phase results if pipeline fails
- Use manifest-to-video endpoint to retry video generation without regenerating content

### 3. Performance Optimization

- Use `/media/manifest-to-silent-video` for quick previews
- Cache manifests to avoid regenerating content
- Process multiple videos in parallel (API supports concurrent requests)

### 4. Content Guidelines

- Keep questions focused and specific
- Provide context to guide explanation style
- Review generated screenplays before video generation
- Test with silent videos before generating full audio

### 5. Manifest Validation Rules

- Template IDs must be unique
- Actions must reference existing templates
- Instance IDs must be created with `fade_in` before use
- Respect shot type constraints (see Data Models section)
- Position references must not create circular dependencies

## Additional Resources

- **Interactive API Docs**: `{BASE_URL}/docs`
- **OpenAPI Schema**: `{BASE_URL}/openapi.json`
- **Health Check**: `{BASE_URL}/health`

For questions or issues, check the request logs using the provided request ID and log file path in the response metadata.
