import os
from flask import Flask, request, jsonify, send_from_directory
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder="static", static_url_path="/static")
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL="openai/gpt-oss-120b" # غيّره إذا تغيّر اسم النموذج في console.groq.com

SYSTEM = """أنت مساعد محل حلويات اسمه عسل وكريمة.
أجب بالعربية البسيطة أو بالدارجة الجزائرية حسب لغة الزبون، بإجابات قصيرة ودودة (3 جمل كحد أقصى).
المعلومات الوحيدة المتاحة:
- كيك الشوكولاتة 2800 دج، فراولة وكريمة 3200 دج، كيك الفستق 3600 دج، كيك الزفاف من 12000 دج ويُحجز مسبقاً.
- بقلاوة 180 دج، مقروط اللوز 180 دج، تشاراك عريان 140 دج، غريبية 100 دج.
- الأسعار تقريبية.
- أوقات العمل: كل يوم من 8 صباحاً إلى 9 مساءً.
- الطلبات الخاصة قبل المناسبة بثلاثة أيام على الأقل، والطلب يتم عبر واتساب.
إذا سُئلت عن شيء غير موجود هنا (توصيل، مكونات دقيقة، حساسية غذائية) فلا تخمّن، وانصح الزبون بالتواصل عبر واتساب."""


@app.route("/")
def index():
    return send_from_directory("static", "index.html")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    messages = []
    for m in data.get("messages", [])[-10:]:
        if m.get("role") in ("user", "assistant") and isinstance(m.get("content"), str):
            messages.append({"role": m["role"], "content": m["content"][:1000]})
    if not messages:
        return jsonify(error="empty"), 400
    try:
        resp = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "system", "content": SYSTEM}] + messages,
            temperature=0.5,
            max_tokens=300,
        )
        return jsonify(reply=resp.choices[0].message.content)
    except Exception as e:
        print("Groq error:", e)
        return jsonify(error="server"), 500


if __name__ == "__main__":
    app.run(debug=True)
