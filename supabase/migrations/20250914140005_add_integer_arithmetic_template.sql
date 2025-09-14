-- Migration: Add Integer Arithmetic Manifest Template
-- Purpose: Add the integer arithmetic angle addition manifest template
-- Created: September 2025

-- Insert the integer arithmetic manifest template
INSERT INTO manifest_templates (
  video_id,
  title,
  description,
  content_kind,
  subject,
  grade_level,
  recipe,
  visual_intent,
  manifest
) VALUES (
  'integer-arithmetic_text-explanation_524206',
  'Extending the Sums of Angles Rule',
  'Advanced geometry: Extending angle addition rule to multiple adjacent angles - demonstrates reflex angle calculations',
  'integer_arithmetic',
  'geometry',
  '6th',
  'text_explanation',
  'text_explanation',
  '{
    "video_id": "integer-arithmetic_text-explanation_524206",
    "templates": [
      {
        "id": "expr_t",
        "type": "MathTex_term",
        "content": "\\frac{100}{1} + \\frac{95}{1} + \\frac{45}{1}",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_0_t",
        "type": "Text",
        "content": "We can extend the angle addition rule to more than two adjacent angles: the measure of a larger angle equals the sum of the measures of all non minus overlapping adjacent angles that fill it.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_1_t",
        "type": "Text",
        "content": "Consider the angles shown below. The three colored angles meet at S and sit between the rays SQ, SP, SR and ST.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_2_t",
        "type": "Text",
        "content": "According to the angle addition rule, the reflex angle with endpoints on SQ and ST equals the sum of the three adjacent angles.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_3_t",
        "type": "Text",
        "content": "Calculation.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_4_t",
        "type": "Text",
        "content": "So the reflex angle <break time=\"0.3s\"/>QST measures 240<break time=\"0.2s\"/>, which is greater than 180<break time=\"0.2s\"/> and less than 360<break time=\"0.2s\"/>.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_5_t",
        "type": "Text",
        "content": "Adjacent angles that do not overlap can be added because each degree around the vertex is counted exactly once.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_6_t",
        "type": "Text",
        "content": "Here the three sectors exactly fill the larger reflex angle from SQ around to ST, so their measures add to the measure of that reflex angle.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_7_t",
        "type": "Text",
        "content": "If a larger angle is known, subtract the known adjacent parts to find the unknown part. In this diagram, if you know m <break time=\"0.3s\"/> QST is 240<break time=\"0.2s\"/> and m <break time=\"0.3s\"/> PSR is 95<break time=\"0.2s\"/> and m <break time=\"0.3s\"/> RST is 45<break time=\"0.2s\"/>, then.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_8_t",
        "type": "Text",
        "content": "This is the same 100<break time=\"0.2s\"/> green angle between SQ and SP shown in the diagram.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "title_t",
        "type": "Text",
        "content": "Extending the Sums of Angles Rule",
        "style": {
          "color": "#F3F4F6"
        }
      }
    ],
    "shots": [
      {
        "actions": [
          {
            "fade_in": {
              "instance_id": "title",
              "template": "title_t",
              "position": {
                "absolute": "top_center"
              }
            }
          },
          {
            "fade_in": {
              "instance_id": "expr",
              "template": "expr_t",
              "position": {
                "below": "title"
              }
            }
          }
        ],
        "voiceover": "Extending the Sums of Angles Rule We can extend the angle addition rule to more than two adjacent angles: the measure of a larger angle equals the sum of the measures of all non minus overlapping adjacent angles that fill it. Consider the angles shown below. The three colored angles meet at S and sit between the rays SQ, SP, SR and ST. According to the angle addition rule, the reflex angle with endpoints on SQ and ST equals the sum of the three adjacent angles. Calculation m QST equals m QSP plus m PSR plus m RST equals 100 plus 95 plus 45 equals 240. So the reflex angle QST measures 240, which is greater than 180 and less than 360. Why this works Adjacent angles that do not overlap can be added because each degree around the vertex is counted exactly once. Here the three sectors exactly fill the larger reflex angle from SQ around to ST, so their measures add to the measure of that reflex angle. Using the rule to find a missing angle If a larger angle is known, subtract the known adjacent parts to find the unknown part. In this diagram, if you know m QST is 240 and m PSR is 95 and m RST is 45, then m QSP equals 240 minus 95 minus 45 equals 100. This is the same 100 green angle between SQ and SP shown in the diagram.",
        "description": "Show title and prompt",
        "contained": true,
        "duration": 84.66666666666667,
        "video_start_time": 0.0,
        "video_end_time": 84.675,
        "start_time": 0.059,
        "end_time": 84.734
      },
      {
        "actions": [
          {
            "fade_in": {
              "instance_id": "text_0",
              "template": "text_0_t",
              "position": {
                "below": "expr",
                "spacing": 1.5
              }
            }
          }
        ],
        "voiceover": "We can extend the angle addition rule to more than two adjacent angles: the measure of a larger angle equals the sum of the measures of all non minus overlapping adjacent angles that fill it.",
        "description": "Explanation point 1",
        "contained": true,
        "duration": 10.233333333333333,
        "video_start_time": 84.675,
        "video_end_time": 94.915,
        "start_time": 84.734,
        "end_time": 94.974
      },
      {
        "actions": [
          {
            "fade_in": {
              "instance_id": "text_1",
              "template": "text_1_t",
              "position": {
                "below": "text_0"
              }
            }
          }
        ],
        "voiceover": "Consider the angles shown below. The three colored angles meet at S and sit between the rays SQ, SP, SR and ST.",
        "description": "Explanation point 2",
        "contained": true,
        "duration": 5.933333333333334,
        "video_start_time": 94.915,
        "video_end_time": 100.854,
        "start_time": 95.015,
        "end_time": 100.954
      },
      {
        "actions": [
          {
            "fade_in": {
              "instance_id": "text_2",
              "template": "text_2_t",
              "position": {
                "below": "text_1"
              }
            }
          }
        ],
        "voiceover": "According to the angle addition rule, the reflex angle with endpoints on SQ and ST equals the sum of the three adjacent angles.",
        "description": "Explanation point 3",
        "contained": true,
        "duration": 9.133333333333333,
        "video_start_time": 100.854,
        "video_end_time": 109.994,
        "start_time": 101.014,
        "end_time": 110.154
      },
      {
        "actions": [
          {
            "fade_in": {
              "instance_id": "text_3",
              "template": "text_3_t",
              "position": {
                "below": "text_2"
              }
            }
          }
        ],
        "voiceover": "Calculation.",
        "description": "Explanation point 4",
        "contained": true,
        "duration": 0.16666666666666666,
        "video_start_time": 109.994,
        "video_end_time": 110.174,
        "start_time": 110.215,
        "end_time": 110.395
      },
      {
        "actions": [
          {
            "fade_in": {
              "instance_id": "text_4",
              "template": "text_4_t",
              "position": {
                "below": "text_3"
              }
            }
          }
        ],
        "voiceover": "So the reflex angle QST measures 240, which is greater than 180 and less than 360.",
        "description": "Explanation point 5",
        "contained": true,
        "duration": 6.733333333333333,
        "video_start_time": 110.174,
        "video_end_time": 116.894,
        "start_time": 110.454,
        "end_time": 117.174
      },
      {
        "actions": [
          {
            "fade_in": {
              "instance_id": "text_5",
              "template": "text_5_t",
              "position": {
                "below": "text_4"
              }
            }
          }
        ],
        "voiceover": "Adjacent angles that do not overlap can be added because each degree around the vertex is counted exactly once.",
        "description": "Explanation point 6",
        "contained": true,
        "duration": 6.766666666666667,
        "video_start_time": 116.894,
        "video_end_time": 123.653,
        "start_time": 117.735,
        "end_time": 124.494
      },
      {
        "actions": [
          {
            "fade_in": {
              "instance_id": "text_6",
              "template": "text_6_t",
              "position": {
                "below": "text_5"
              }
            }
          }
        ],
        "voiceover": "Here the three sectors exactly fill the larger reflex angle from SQ around to ST, so their measures add to the measure of that reflex angle.",
        "description": "Explanation point 7",
        "contained": true,
        "duration": 9.1,
        "video_start_time": 123.653,
        "video_end_time": 132.753,
        "start_time": 124.514,
        "end_time": 133.614
      },
      {
        "actions": [
          {
            "fade_in": {
              "instance_id": "text_7",
              "template": "text_7_t",
              "position": {
                "below": "text_6"
              }
            }
          }
        ],
        "voiceover": "If a larger angle is known, subtract the known adjacent parts to find the unknown part. In this diagram, if you know m QST is 240 and m PSR is 95 and m RST is 45, then.",
        "description": "Explanation point 8",
        "contained": true,
        "duration": 14.966666666666667,
        "video_start_time": 132.753,
        "video_end_time": 147.713,
        "start_time": 133.674,
        "end_time": 148.634
      },
      {
        "actions": [
          {
            "fade_in": {
              "instance_id": "text_8",
              "template": "text_8_t",
              "position": {
                "below": "text_7"
              }
            }
          }
        ],
        "voiceover": "This is the same 100 green angle between SQ and SP shown in the diagram.",
        "description": "Explanation point 9",
        "contained": true,
        "duration": 3.933333333333333,
        "video_start_time": 147.713,
        "video_end_time": 151.634,
        "start_time": 148.654,
        "end_time": 152.575
      }
    ],
    "metadata": {
      "recipe": "text_explanation",
      "content_kind": "integer_arithmetic",
      "visual_intent": "text_explanation"
    }
  }'::jsonb
);
