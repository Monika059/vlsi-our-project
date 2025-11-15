try:
    import openai  # type: ignore
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:  # pragma: no cover - handled at runtime
    OPENAI_AVAILABLE = False
    OpenAI = None

from typing import Any, Dict, List, Optional

import json
import re
import base64
import mimetypes
from pathlib import Path


class _LegacyChatClient:
    """Adapter for the legacy openai.ChatCompletion API."""

    def __init__(self) -> None:
        if not OPENAI_AVAILABLE:
            raise RuntimeError("OpenAI SDK not available")

    def completions_create(self, *, model: str, messages: List[Dict[str, str]], temperature: float, response_format: Optional[Dict[str, str]] = None):
        params: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
        }
        if response_format and "type" in response_format and response_format["type"] == "json_object":
            params["functions"] = [
                {
                    "name": "respond",
                    "parameters": {"type": "object"},
                }
            ]
            params["function_call"] = {"name": "respond"}

        return openai.ChatCompletion.create(**params)  # type: ignore[attr-defined]


class _LegacyCompletions:
    def create(self, **kwargs):
        return _LegacyChatClient().completions_create(**kwargs)


class _LegacyChat:
    def __init__(self) -> None:
        self.completions = _LegacyCompletions()


class _LegacyOpenAIWrapper:
    """Minimal wrapper to provide the new client interface on older SDKs."""

    def __init__(self) -> None:
        self.chat = _LegacyChat()


def _parse_major_version(raw_version: str) -> int:
    try:
        return int((raw_version or "0").split(".")[0])
    except ValueError:
        return 0


class AIAssistant:
    """AI-powered assistant for Verilog code analysis, debugging, and education."""
    
    def __init__(self, api_key: str):
        if OPENAI_AVAILABLE and api_key:
            self.client = self._create_client(api_key)
        else:
            self.client = None
        self.model = "gpt-4o-mini"

    def _create_client(self, api_key: str):
        """Instantiate the OpenAI client, handling version compatibility."""
        if not OPENAI_AVAILABLE:
            return None

        openai_version = getattr(openai, "__version__", "0")

        if _parse_major_version(openai_version) >= 1:
            return OpenAI(api_key=api_key)

        # Older SDKs (<1.0) use global configuration
        openai.api_key = api_key
        return _LegacyOpenAIWrapper()

    def chat(self, message: str) -> str:
        """General conversational assistant used by the chat bar"""
        clean_message = (message or "").strip()
        if not clean_message:
            return "I didn't receive a message. Could you please type something for me to help with?"

        if self.client:
            try:
                response = self.client.chat.completions.create(  # type: ignore[call-arg]
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are Cascade Tutor, an encouraging VLSI design mentor."
                                " When a user shares HDL or RTL code, provide a concise teaching overview:"
                                " summarise the design intent, highlight key constructs, and explain how the"
                                " elements interact. Offer practical tips, verification steps, and next actions"
                                " a student could take. Use clear section headings or bold labels so learners"
                                " can follow along. Respond in a friendly, supportive tone and keep answers"
                                " focused on the question."
                            ),
                        },
                        {"role": "user", "content": clean_message},
                    ],
                    temperature=0.6,
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                message = str(e)
                if "rate limit" in message.lower():
                    print("AI Chat rate limit encountered; switching to fallback tutor mode.")
                    return self._fallback_chat(clean_message)
                print(f"AI Chat error: {e}")
                return self._fallback_chat(clean_message)

        return self._fallback_chat(clean_message)

    def analyze_code(self, code: str, parse_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze Verilog code and provide AI-powered insights
        """
        if not self.client:
            return self._fallback_analysis(code, parse_result)
        
        try:
            prompt = f"""You are an expert VLSI design educator helping Electronics and Communication Engineering students.

Analyze this Verilog code and provide educational feedback:

```verilog
{code}
```

Parser detected:
- Errors: {len(parse_result.get('errors', []))}
- Warnings: {len(parse_result.get('warnings', []))}

Provide a JSON response with:
1. "suggestions": List of improvement suggestions with explanations
2. "optimizations": List of optimization opportunities
3. "educational_notes": Key learning points for students
4. "quality_score": Overall code quality score (0-100)

Format each suggestion as: {{"title": "...", "description": "...", "severity": "info|warning|error", "educational_context": "..."}}
"""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert VLSI design educator. Provide clear, educational feedback for students learning Verilog."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            print(f"AI Analysis error: {e}")
            return self._fallback_analysis(code, parse_result)
    def debug_code(self, code: str, error_message: str = "") -> Dict[str, Any]:
        """
        Provide debugging assistance for Verilog code
        """
        if not self.client:
            return self._fallback_debug(code, error_message)

        try:
            prompt = f"""You are helping a student debug their Verilog code.
        
    
Code:
```verilog
{code}
```

Provide a JSON response with:
1. "suggestions": List of optimization suggestions
2. "optimized_code": Optimized version of the code
3. "improvements": Quantitative improvements (e.g., reduced gates, better timing)
4. "explanations": Educational explanations for each optimization

Format each suggestion as: {{"optimization": "...", "benefit": "...", "explanation": "...", "difficulty": "beginner|intermediate|advanced"}}
"""
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert in RTL optimization teaching students best practices."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(response.choices[0].message.content)
            return result

        except Exception as e:
            print(f"AI Debug error: {e}")
            return self._fallback_debug(code, error_message)

    def optimize_code(self, code: str, goals: List[str]) -> Dict[str, Any]:
        """Provide code optimization suggestions."""
        if not self.client:
            return self._fallback_optimize(code, goals)

        try:
            goals_str = ", ".join(goals)
            prompt = f"""Optimize this Verilog code for: {goals_str}""" 

            result = json.loads(response.choices[0].message.content)
            return result
   
        except Exception as e:
            print(f"AI Optimize error: {e}")
            return self._fallback_optimize(code, goals)
    
    def explain_concept(self, code: str = "", concept: str = "") -> Dict[str, Any]:
        """
        Explain Verilog concepts and code snippets
        """
        if not self.client:
            return self._fallback_explain(code, concept)

        try:
            if code and concept:
                prompt = f"""Explain the concept of '{concept}' in the context of this Verilog code:

```verilog
{{ ... }}
```
    provide explanation """
            result = json.loads(response.choices[0].message.content)
            return result
            
        except Exception as e:
            print(f"AI Explain error: {e}")
            return self._fallback_explain(code, concept)

    def analyze_upload(self, file_path: str) -> str:
        """Generate an AI response tailored to an uploaded asset (image or code file)."""
        file_path = Path(file_path)
        if not file_path.exists():
            return "I couldn't access the uploaded file for analysis."

        extension = file_path.suffix.lower()

        # Handle image files with vision model support
        if extension in {".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"}:
            if not self.client:
                return "Image received. Configure the OpenAI API key on the backend to enable visual analysis."

            mime_type = mimetypes.guess_type(file_path.name)[0] or "image/png"
            try:
                with open(file_path, "rb") as image_file:
                    encoded_image = base64.b64encode(image_file.read()).decode("utf-8")

                response = self.client.chat.completions.create(  # type: ignore[call-arg]
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": (
                                "You are a VLSI design tutor. Describe the uploaded visual artifact and explain"
                                " how it relates to digital logic, schematics, or Verilog concepts in concise terms."
                            ),
                        },
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": (
                                        "The student uploaded this diagram or handwritten note. Provide a clear summary,"
                                        " identify any Verilog modules, truth tables, or design intent you can infer,"
                                        
                                        " and suggest next steps for implementing it in code."
                                        "Summarize this diagram or note, identify possible Verilog modules or logic, "
                                        "and suggest next implementation steps."
                                    ),
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:{mime_type};base64,{encoded_image}"
                                    },
                                },
                            ],
                        },
                    ],
                    temperature=0.5,
                )

                content = response.choices[0].message.content
                if isinstance(content, list):
                    return "\n".join(
                        part.get("text", "") for part in content if isinstance(part, dict) and part.get("type") == "text"
                    ).strip()
                return (content or "").strip()
            except Exception as exc:
                print(f"AI upload image analysis error: {exc}")
                return (
                    "I received the image but couldn't analyze it automatically."
                    " Please retry later or describe the contents in text."
                )

        # Handle textual code/document uploads
        if extension in {".v", ".sv", ".vh", ".txt"}:
            try:
                file_text = file_path.read_text(encoding="utf-8", errors="ignore")
            except Exception as exc:
                print(f"Failed reading uploaded text file: {exc}")
                file_text = ""

            snippet = file_text[:4000]

            if not self.client:
                return (
                    "I stored the file successfully. Add an OpenAI key to enable automatic review,"
                    " or paste the relevant code into the chat for manual guidance."
                )

            try:
                response = self.client.chat.completions.create(  # type: ignore[call-arg]
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a VLSI design assistant reviewing uploaded Verilog or HDL snippets.",
                        },
                        {
                            "role": "user",
                            "content": (
                                f"The student uploaded `{file_path.name}`. Provide a concise summary, point out key modules,"
                                " and highlight any obvious issues or areas to double-check. Code excerpt:\n\n" + snippet
                            ),
                        },
                    ],
                    temperature=0.6,
                )
                return response.choices[0].message.content.strip()
            except Exception as exc:
                print(f"AI upload code analysis error: {exc}")
                return (
                    "I saved the file but couldn't analyze it automatically."
                    " You can still open it in the editor or paste sections here for feedback."
                )

        # Unsupported file types
        return (
            "File uploaded successfully. Automatic understanding for this file type isn't available yet."
            " Please upload images or HDL/text files for AI feedback."
        )

    # Fallback methods when AI is not available
    
    def _fallback_analysis(self, code: str, parse_result: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback analysis without AI"""
        suggestions = []
        if 'always @(*)' in code:
            suggestions.append({
                "title": "Combinational Always Block",
                "description": "Using always @(*) for combinational logic",
                "severity": "info",
                "educational_context": "This is good practice for combinational logic as it automatically includes all inputs in the sensitivity list."
            })
        
        quality_score = 70
        if parse_result.get('errors'):
            quality_score -= len(parse_result['errors']) * 10
        if parse_result.get('warnings'):
            quality_score -= len(parse_result['warnings']) * 5
        
        return {
            "suggestions": suggestions,
            "optimizations": [],
            "educational_notes": [
                "Always use meaningful signal names",
                "Comment your code to explain design intent",
                "Use non-blocking assignments (<=) in sequential logic"
            ],
            "quality_score": max(0, min(100, quality_score))
        }
    
    def _fallback_debug(self, code: str, error_message: str) -> Dict[str, Any]:
        """Fallback debugging without AI"""
        return {
            "explanation": "AI assistant is not configured. Please check your OpenAI API key.",
            "fixes": [
                {
                    "step": "Review syntax errors",
                    "explanation": "Check for missing semicolons, unmatched parentheses, and balanced begin/end blocks",
                    "code_snippet": ""
                }
            ],
            "corrected_code": code,
            "learning_resources": [
                "Verilog syntax basics",
                "Common syntax errors",
                "Debugging techniques"
            ]
        }
    
    def _fallback_optimize(self, code: str, goals: List[str]) -> Dict[str, Any]:
        """Fallback optimization without AI"""
        return {
            "suggestions": [
                {
                    "optimization": "Use continuous assignments for simple logic",
                    "benefit": "Cleaner code and better synthesis",
                    "explanation": "For simple combinational logic, assign statements are more readable than always blocks",
                    "difficulty": "beginner"
                }
            ],
            "optimized_code": code,
            "improvements": {
                "readability": "Improved",
                "synthesis": "Optimized"
            },
            "explanations": [
                "AI assistant is not configured. Basic optimization suggestions provided."
            ]
        }
    
    def _fallback_explain(self, code: str, concept: str) -> Dict[str, Any]:
        """Fallback explanation without AI"""
        return {
            "explanation": f"AI assistant is not configured. Please set up your OpenAI API key to get detailed explanations about {concept if concept else 'this code'}.",
            "examples": [],
            "best_practices": [
                "Use meaningful signal names",
                "Comment your code",
                "Follow consistent coding style"
            ],
            "common_mistakes": [
                "Mixing blocking and non-blocking assignments",
                "Incomplete sensitivity lists",
                "Inferred latches in combinational logic"
            ],
            "related_topics": []
        }

    def _fallback_chat(self, message: str) -> str:
        """Simple rule-based chat response when OpenAI isn't available"""
        lower = message.lower()

        greetings = {"hi", "hello", "hey", "hola", "hii", "hlo"}
        gratitude = {"thanks", "thank you", "appreciate"}

        if any(greet in lower for greet in greetings):
            return (
                "Hey there! I'm in offline tutor mode right now and ready to help."
                "\nTell me what you're building or stuck on—I can explain Verilog basics, common mistakes, and study tips."
                "\nShare a snippet or question and we'll break it down together."
            )

        if any(word in lower for word in gratitude):
            return "You're welcome! Feel free to share Verilog questions or snippets for more guidance."

        likely_code = any(keyword in lower for keyword in {"module", "assign", "always", "wire", "reg", "input", "output"})

        if likely_code:
            modules = re.findall(r"module\s+([a-zA-Z0-9_]+)", message)
            has_posedge = "posedge" in lower
            has_negedge = "negedge" in lower
            has_always_comb = "always @(*)" in lower or "always_comb" in lower
            assigns = re.findall(r"assign\s+([a-zA-Z0-9_]+)", message)

            lines = [line.strip() for line in message.splitlines() if line.strip()]
            estimated_loc = len(lines)

            sections = []
            if modules:
                module_list = ", ".join(sorted(set(modules)))
                sections.append(f"- **Modules**: Defines {module_list}.")
            else:
                sections.append("- **Modules**: No `module` header detected; this might be a fragment or testbench excerpt.")

            if has_posedge or has_negedge:
                edge_desc = []
                if has_posedge:
                    edge_desc.append("posedge clocked blocks (sequential logic)")
                if has_negedge:
                    edge_desc.append("negedge sensitivity (possibly reset handling)")
                sections.append(f"- **Sequential logic**: Contains {' and '.join(edge_desc)}. Review register resets and timing.")
            elif has_always_comb:
                sections.append("- **Combinational logic**: Uses `always @(*)`/`always_comb` for pure combinational behaviour.")

            if assigns:
                assigns_list = ", ".join(sorted(set(assigns[:5])))
                more = " (and more)" if len(assigns) > 5 else ""
                sections.append(f"- **Continuous assigns**: Signals like {assigns_list}{more} are driven with `assign` statements.")

            sections.append("- **Study tips**: Trace signal flow from inputs to outputs, write a quick testbench, and annotate timing assumptions.")
            sections.append("- **Next steps**: Simulate the design, inspect waveforms for hazards, and document design intent for classmates.")

            header = f"Here's a quick offline breakdown ({estimated_loc} lines detected):"
            return "\n".join([header, *sections])

        if "analyze" in lower or "explain" in lower or "optimize" in lower:
            return (
                "I'd love to dig deeper! Drop your code or topic and I'll outline key checkpoints, pitfalls, and practice ideas."
                "\nFor simulations or advanced AI breakdowns, keep notes handy and we can sketch a manual plan together."
            )

        if "how" in lower or "what" in lower or "why" in lower:
            return (
                "I can offer basic pointers, but for detailed answers please enable the OPENAI_API_KEY on the backend service."
            )

        return (
            "I'm here and listening. Describe your Verilog question or paste code and I'll share core insights with study pointers."
            "\nLet me know the module, concept, or bug you're dealing with and we'll walk through it step by step."
        )
