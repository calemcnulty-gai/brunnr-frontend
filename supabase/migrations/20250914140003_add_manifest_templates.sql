-- Migration: Add Manifest Templates Table
-- Purpose: Store prebuilt manifest templates for quick video generation
-- Created: September 2025

-- ============================================
-- 1. MANIFEST TEMPLATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS manifest_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  content_kind TEXT NOT NULL, -- 'fraction_sub_same_den', 'geometry', 'data_analysis', etc.
  subject TEXT NOT NULL, -- 'math', 'geometry', 'data_analysis'
  grade_level TEXT, -- '4th', '5th', etc.
  recipe TEXT NOT NULL, -- 'number_line_fraction_walk', 'geometry_explanation', etc.
  visual_intent TEXT, -- 'number_line_walk', 'angle_addition', 'line_plot_frequency'
  manifest JSONB NOT NULL, -- The full manifest JSON
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create indexes for performance
CREATE INDEX idx_manifest_templates_content_kind ON manifest_templates (content_kind);
CREATE INDEX idx_manifest_templates_subject ON manifest_templates (subject);
CREATE INDEX idx_manifest_templates_grade_level ON manifest_templates (grade_level);
CREATE INDEX idx_manifest_templates_recipe ON manifest_templates (recipe);
CREATE INDEX idx_manifest_templates_active ON manifest_templates (is_active, created_at DESC);

-- ============================================
-- 2. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE manifest_templates ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read templates
CREATE POLICY "Users can view active manifest templates" ON manifest_templates
  FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);

-- Only admins can manage templates
CREATE POLICY "Admins can manage manifest templates" ON manifest_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- 3. HELPER FUNCTIONS
-- ============================================

-- Function to get templates by subject/grade
CREATE OR REPLACE FUNCTION get_manifest_templates(
  p_subject TEXT DEFAULT NULL,
  p_grade_level TEXT DEFAULT NULL,
  p_content_kind TEXT DEFAULT NULL
) RETURNS TABLE (
  id UUID,
  video_id TEXT,
  title TEXT,
  description TEXT,
  content_kind TEXT,
  subject TEXT,
  grade_level TEXT,
  recipe TEXT,
  visual_intent TEXT,
  manifest JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mt.id,
    mt.video_id,
    mt.title,
    mt.description,
    mt.content_kind,
    mt.subject,
    mt.grade_level,
    mt.recipe,
    mt.visual_intent,
    mt.manifest,
    mt.created_at
  FROM manifest_templates mt
  WHERE mt.is_active = true
    AND (p_subject IS NULL OR mt.subject = p_subject)
    AND (p_grade_level IS NULL OR mt.grade_level = p_grade_level)
    AND (p_content_kind IS NULL OR mt.content_kind = p_content_kind)
  ORDER BY mt.subject, mt.grade_level, mt.content_kind, mt.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. SEED DATA - Load the sample manifests
-- ============================================

-- Insert the fraction subtraction manifest
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
  'fraction-sub-same-den_number-line-walk_bb2dae',
  'Fraction Subtraction with Same Denominator',
  'Example: Adding and Subtracting Fractions Using Number Line Models - demonstrates 7/9 - 5/9 = 2/9',
  'fraction_sub_same_den',
  'math',
  '4th',
  'number_line_fraction_walk',
  'number_line_walk',
  '{
    "video_id": "fraction-sub-same-den_number-line-walk_bb2dae",
    "templates": [
      {
        "id": "end_pos_t",
        "type": "MathTex_term",
        "content": "\\frac{2}{9}",
        "style": {
          "color": "#EF4444"
        }
      },
      {
        "id": "expr_t",
        "type": "MathTex_term",
        "content": "\\frac{7}{9} - \\frac{5}{9}",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "numline_plain_t",
        "type": "number_line"
      },
      {
        "id": "numline_ticks_t",
        "type": "number_line",
        "content": {
          "ticks": [
            "\\frac{0}{9}",
            "\\frac{1}{9}",
            "\\frac{2}{9}",
            "\\frac{3}{9}",
            "\\frac{4}{9}",
            "\\frac{5}{9}",
            "\\frac{6}{9}",
            "\\frac{7}{9}",
            "\\frac{8}{9}",
            "\\frac{9}{9}"
          ]
        }
      },
      {
        "id": "result_t",
        "type": "MathTex_term",
        "content": "\\frac{2}{9}",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "start_pos_t",
        "type": "MathTex_term",
        "content": "\\frac{7}{9}",
        "style": {
          "color": "#60A5FA"
        }
      },
      {
        "id": "title_t",
        "type": "Text",
        "content": "Example: Adding and Subtracting Fractions Using Number Line Models",
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
        "voiceover": "Let''s find seven ninths minus five ninths We''ll use a number line to solve this problem.",
        "description": "Introduce problem",
        "contained": true
      },
      {
        "actions": [
          {
            "fade_in": {
              "instance_id": "numline",
              "template": "numline_plain_t",
              "position": {
                "below": "expr",
                "spacing": 2.0
              }
            }
          }
        ],
        "voiceover": "First, let''s draw a number line.",
        "description": "Show blank number line",
        "contained": true
      },
      {
        "actions": [
          {
            "morph": {
              "from": "numline",
              "to": "numline_ticks_t"
            }
          }
        ],
        "voiceover": "We''ll divide it into 9 equal parts.",
        "description": "Add tick marks and labels",
        "contained": true
      },
      {
        "actions": [
          {
            "custom_object_animation": {
              "instance_id": "numline",
              "kind": "highlight_tick",
              "props": {
                "tick_index": 7,
                "color": "#60A5FA",
                "duration": 1.0,
                "denominator": 9
              }
            }
          }
        ],
        "voiceover": "We start at 7 over 9.",
        "description": "Highlight starting position",
        "contained": true
      },
      {
        "actions": [
          {
            "custom_object_animation": {
              "instance_id": "numline",
              "kind": "animated_walk",
              "props": {
                "from_tick": 7,
                "steps": -5,
                "step_duration": 0.4,
                "show_arrows": true,
                "arrow_color": "#60A5FA",
                "denominator": 9
              }
            }
          }
        ],
        "voiceover": "Now we move 5 steps to the left.",
        "description": "Animate step-by-step left movement",
        "contained": true
      },
      {
        "actions": [
          {
            "custom_object_animation": {
              "instance_id": "numline",
              "kind": "highlight_tick",
              "props": {
                "tick_index": 2,
                "color": "#EF4444",
                "duration": 1.0,
                "denominator": 9
              }
            }
          },
          {
            "fade_in": {
              "instance_id": "result",
              "template": "result_t",
              "position": {
                "right_of": "numline",
                "spacing": 2.0
              }
            }
          }
        ],
        "voiceover": "We end at two ninths.",
        "description": "Highlight ending position and show result",
        "contained": true
      },
      {
        "actions": [],
        "voiceover": "Therefore, the answer is two ninths.",
        "description": "Conclusion"
      }
    ],
    "metadata": {
      "recipe": "number_line_fraction_walk",
      "content_kind": "fraction_sub_same_den",
      "visual_intent": "number_line_walk"
    }
  }'::jsonb
);

-- Insert the fraction addition manifest
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
  'fraction-add-same-den_number-line-walk_e6e284',
  'Fraction Addition with Same Denominator',
  'Number line demonstration of fraction addition - shows 95/1 + 45/1 = 140/1',
  'fraction_add_same_den',
  'math',
  '4th',
  'number_line_fraction_walk',
  'number_line_walk',
  '{
    "video_id": "fraction-add-same-den_number-line-walk_e6e284",
    "templates": [
      {
        "id": "end_pos_t",
        "type": "MathTex_term",
        "content": "\\frac{140}{1}",
        "style": {
          "color": "#EF4444"
        }
      },
      {
        "id": "expr_t",
        "type": "MathTex_term",
        "content": "\\frac{95}{1} + \\frac{45}{1}",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "numline_plain_t",
        "type": "number_line"
      },
      {
        "id": "numline_ticks_t",
        "type": "number_line",
        "content": {
          "ticks": [
            "\\frac{0}{1}",
            "\\frac{1}{1}"
          ]
        }
      },
      {
        "id": "result_t",
        "type": "MathTex_term",
        "content": "\\frac{140}{1}",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "start_pos_t",
        "type": "MathTex_term",
        "content": "\\frac{95}{1}",
        "style": {
          "color": "#60A5FA"
        }
      },
      {
        "id": "title_t",
        "type": "Text",
        "content": "Introduction",
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
        "voiceover": "Let''s find ninety-five oneths plus forty-five oneths We''ll use a number line to solve this problem.",
        "description": "Introduce problem",
        "contained": true
      },
      {
        "actions": [
          {
            "fade_in": {
              "instance_id": "numline",
              "template": "numline_plain_t",
              "position": {
                "below": "expr",
                "spacing": 2.0
              }
            }
          }
        ],
        "voiceover": "First, let''s draw a number line.",
        "description": "Show blank number line",
        "contained": true
      },
      {
        "actions": [
          {
            "morph": {
              "from": "numline",
              "to": "numline_ticks_t"
            }
          }
        ],
        "voiceover": "We''ll divide it into 1 equal parts.",
        "description": "Add tick marks and labels",
        "contained": true
      },
      {
        "actions": [
          {
            "custom_object_animation": {
              "instance_id": "numline",
              "kind": "highlight_tick",
              "props": {
                "tick_index": 95,
                "color": "#60A5FA",
                "duration": 1.0,
                "denominator": 1
              }
            }
          }
        ],
        "voiceover": "We start at 95 over 1.",
        "description": "Highlight starting position",
        "contained": true
      },
      {
        "actions": [
          {
            "custom_object_animation": {
              "instance_id": "numline",
              "kind": "animated_walk",
              "props": {
                "from_tick": 95,
                "steps": 45,
                "step_duration": 0.4,
                "show_arrows": true,
                "arrow_color": "#60A5FA",
                "denominator": 1
              }
            }
          }
        ],
        "voiceover": "Now we move 45 steps to the right.",
        "description": "Animate step-by-step right movement",
        "contained": true
      },
      {
        "actions": [
          {
            "custom_object_animation": {
              "instance_id": "numline",
              "kind": "highlight_tick",
              "props": {
                "tick_index": 140,
                "color": "#EF4444",
                "duration": 1.0,
                "denominator": 1
              }
            }
          },
          {
            "fade_in": {
              "instance_id": "result",
              "template": "result_t",
              "position": {
                "right_of": "numline",
                "spacing": 2.0
              }
            }
          }
        ],
        "voiceover": "We end at 140 oneths.",
        "description": "Highlight ending position and show result",
        "contained": true
      },
      {
        "actions": [],
        "voiceover": "Therefore, the answer is 140 oneths.",
        "description": "Conclusion"
      }
    ],
    "metadata": {
      "recipe": "number_line_fraction_walk",
      "content_kind": "fraction_add_same_den",
      "visual_intent": "number_line_walk"
    }
  }'::jsonb
);

-- Insert the geometry angle addition manifest
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
  'geometry_angle-addition_88281b',
  'Angle Addition Postulate',
  'Example: Finding the Measure of a Combined Angle - demonstrates how adjacent angles combine',
  'geometry',
  'geometry',
  '5th',
  'geometry_explanation',
  'angle_addition',
  '{
    "video_id": "geometry_angle-addition_88281b",
    "templates": [
      {
        "id": "text_0_t",
        "type": "Text",
        "content": "First, notice that ∠POQ and ∠QOR are adjacent because they share the same side OQ. For adjacent angles with a common vertex, the measure of the larger angle equals the sum of the measures of its non-overlapping parts.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_1_t",
        "type": "Text",
        "content": "Therefore we add the two adjacent angles to get the measure of the combined angle ∠POR.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_2_t",
        "type": "Text",
        "content": "m∠POR = m∠POQ + m∠QOR = 68° + 37° = 105°",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "title_t",
        "type": "Text",
        "content": "Example: Finding the Measure of a Combined Angle",
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
          }
        ],
        "voiceover": "In the figure below, determine m∠POR.",
        "description": "Show title and introduce geometric concepts",
        "contained": true
      },
      {
        "actions": [
          {
            "fade_in": {
              "instance_id": "text_0",
              "template": "text_0_t",
              "position": {
                "below": "title"
              }
            }
          }
        ],
        "voiceover": "First, notice that angle POQ and angle QOR are adjacent because they share the same side OQ. For adjacent angles with a common vertex, the measure of the larger angle equals the sum of the measures of its non-overlapping parts.",
        "description": "Geometric explanation point 1",
        "contained": true
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
        "voiceover": "Therefore we add the two adjacent angles to get the measure of the combined angle POR.",
        "description": "Geometric explanation point 2",
        "contained": true
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
        "voiceover": "m angle P O R equals m angle P O Q plus m angle Q O R equals 68 degrees plus 37 degrees equals 105 degrees.",
        "description": "Geometric calculation",
        "contained": true
      }
    ],
    "metadata": {
      "recipe": "geometry_explanation",
      "content_kind": "geometry",
      "visual_intent": "angle_addition"
    }
  }'::jsonb
);

-- Insert the data analysis manifest
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
  'data-analysis_line-plot-frequency_88281b',
  'Line Plot Frequency Analysis',
  'Data analysis example: Pizza delivery frequency analysis using line plots',
  'data_analysis',
  'math',
  '4th',
  'data_analysis_explanation',
  'line_plot_frequency',
  '{
    "video_id": "data-analysis_line-plot-frequency_88281b",
    "templates": [
      {
        "id": "text_0_t",
        "type": "Text",
        "content": "The plot tells us that:",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_1_t",
        "type": "Text",
        "content": "on the first night, 4 pizzas were delivered.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_2_t",
        "type": "Text",
        "content": "on the second night, 2 pizzas were delivered.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_3_t",
        "type": "Text",
        "content": "on the third night, 2 pizzas were delivered.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_4_t",
        "type": "Text",
        "content": "on the fourth night, 3 pizzas were delivered.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_5_t",
        "type": "Text",
        "content": "on the fifth night, 5 pizzas were delivered.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_6_t",
        "type": "Text",
        "content": "on the sixth night, 6 pizzas were delivered.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_7_t",
        "type": "Text",
        "content": "on the seventh night, 4 pizzas were delivered.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_8_t",
        "type": "Text",
        "content": "They delivered five or more pizzas on the fifth night and the sixth night only.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_9_t",
        "type": "Text",
        "content": "Therefore, they delivered five or more pizzas on 2 nights.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "text_10_t",
        "type": "Text",
        "content": "Tip: On a line plot, the number of crosses stacked above a value is the frequency. To answer questions like this, look for stacks that meet the condition and count how many positions satisfy it.",
        "style": {
          "color": "#F3F4F6"
        }
      },
      {
        "id": "title_t",
        "type": "Text",
        "content": "Mathematical Concept",
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
          }
        ],
        "voiceover": "A local meal delivery service kept track of the number of promotional pizzas delivered each night during the last week. The line plot below shows the results, where each cross represents one pizza. How many nights did they deliver 5 or more pizzas?",
        "description": "Show title and introduce data analysis concepts",
        "contained": true
      },
      {
        "actions": [
          {
            "fade_in": {
              "instance_id": "text_0",
              "template": "text_0_t",
              "position": {
                "below": "title"
              }
            }
          }
        ],
        "voiceover": "The plot tells us that:",
        "description": "Data analysis explanation point 1",
        "contained": true
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
        "voiceover": "on the first night, 4 pizzas were delivered.",
        "description": "Data analysis explanation point 2",
        "contained": true
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
        "voiceover": "on the second night, 2 pizzas were delivered.",
        "description": "Data analysis explanation point 3",
        "contained": true
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
        "voiceover": "on the third night, 2 pizzas were delivered.",
        "description": "Data analysis explanation point 4",
        "contained": true
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
        "voiceover": "on the fourth night, 3 pizzas were delivered.",
        "description": "Data analysis explanation point 5",
        "contained": true
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
        "voiceover": "on the fifth night, 5 pizzas were delivered.",
        "description": "Data analysis explanation point 6",
        "contained": true
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
        "voiceover": "on the sixth night, 6 pizzas were delivered.",
        "description": "Data analysis explanation point 7",
        "contained": true
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
        "voiceover": "on the seventh night, 4 pizzas were delivered.",
        "description": "Data analysis explanation point 8",
        "contained": true
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
        "voiceover": "They delivered five or more pizzas on the fifth night and the sixth night only.",
        "description": "Data analysis explanation point 9",
        "contained": true
      },
      {
        "actions": [
          {
            "fade_in": {
              "instance_id": "text_9",
              "template": "text_9_t",
              "position": {
                "below": "text_8"
              }
            }
          }
        ],
        "voiceover": "Therefore, they delivered five or more pizzas on 2 nights.",
        "description": "Data analysis explanation point 10",
        "contained": true
      },
      {
        "actions": [
          {
            "fade_in": {
              "instance_id": "text_10",
              "template": "text_10_t",
              "position": {
                "below": "text_9"
              }
            }
          }
        ],
        "voiceover": "Tip: On a line plot, the number of crosses stacked above a value is the frequency. To answer questions like this, look for stacks that meet the condition and count how many positions satisfy it.",
        "description": "Data analysis explanation point 11",
        "contained": true
      }
    ],
    "metadata": {
      "recipe": "data_analysis_explanation",
      "content_kind": "data_analysis",
      "visual_intent": "line_plot_frequency"
    }
  }'::jsonb
);