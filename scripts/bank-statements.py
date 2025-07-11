from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.colors import HexColor
from reportlab.platypus import Table, TableStyle
from reportlab.lib.utils import ImageReader
import os
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
import random
from datetime import datetime, timedelta
from calendar import monthrange
from datetime import datetime
from faker import Faker
# Register Roboto fonts
pdfmetrics.registerFont(TTFont("Roboto-Regular", "Roboto/Roboto.ttf"))

pdfmetrics.registerFont(TTFont("Roboto-SemiCondensed-Bold", "Roboto/Static/Roboto_SemiCondensed-Bold.ttf"))
pdfmetrics.registerFont(TTFont("Roboto-Thin", "Roboto/Static/Roboto-Thin.ttf"))
pdfmetrics.registerFont(TTFont("Roboto-Medium", "Roboto/Static/Roboto-Medium.ttf"))
pdfmetrics.registerFont(TTFont("Roboto-Light", "Roboto/Static/Roboto-Light.ttf"))

fake = Faker()

def parse_currency(val: str) -> float:
    val = val.replace("$", "").replace(",", "").replace(" ", "")
    if val.startswith("-"):
        return -float(val[1:])
    return float(val)

def get_statement_date_range_string(year: int, month: int) -> str:
    start = datetime(year, month, 1)
    end = datetime(year, month, monthrange(year, month)[1])

    return f"{start.strftime('%b %d, %Y')} thru {end.strftime('%b %d, %Y')}"

def generate_random_transactions_for_months(months, year, year_end_target, initial):
    from calendar import monthrange
    monthly_targets = {}

    # Distribute revenue proportionally across selected months
    per_month = round(year_end_target / 12, 2)
    for month in months:
        ym_key = f"{year}-{month}"
        monthly_targets[ym_key] = per_month

    all_transactions = {}

    for month in months:
        ym_key = f"{year}-{month}"
        start_day = datetime(year, int(month), 1)
        end_day = datetime(year, int(month), monthrange(year, int(month))[1])
        transactions = generate_random_transactions(
            start_date=datetime(year, int(month), 1),
            end_date=datetime(year, int(month), monthrange(year, int(month))[1]),
            starting_balance=initial,
            ran=None
        )

        all_transactions[ym_key] = transactions

    return all_transactions

def generate_random_transactions(start_date, end_date, ran, starting_balance):
    deposit_descs = [
        lambda: "Novo Boost: Stripe ID po_" + fake.lexify(text='??????????????????'),
        lambda: "STRIPE TRANSFER ID NBR: ST-" + fake.lexify(text='????????????????'),
        lambda: "HLTHi TRANSFER ID NBR: ST-" + fake.lexify(text='????????????????'),
    ]

    withdrawal_descs = [
        lambda: "GOOGLE ADS" + fake.lexify(text='##########') + " POS",
        lambda: "CHASE CREDIT CRD AUTOPAYBUS",
        lambda: "THOMASCOMPANY " + fake.numerify(text='##########') + " ACH ID NBR: CPA FEE",
        lambda: "GUSTO " + fake.lexify(text='????????????') + " FEE",
        lambda: "META ADS " + fake.lexify(text='????????????') + " CPAI TR",
        lambda: "X ADS " + fake.lexify(text='????????????') + " CPMI",
        lambda: "REDDIT " + fake.lexify(text='????????????') + " MBR",
        lambda: "HeyFlow " + fake.lexify(text='????????????'),
        lambda: "WebFlow " + fake.lexify(text='????????????'),
        lambda: "PayPal TX: " + fake.lexify(text='????????????'),
        lambda: "WeFunder TX: " + fake.lexify(text='????????????'),
    ]

    type_map = {
        "Deposit": "Deposit",
        "POS Withdrawal": "POS<br/>Withdrawal",
        "External Withdrawal": "External<br/>Withdrawal"
    }

    transactions = []
    used_dates = set()

    # --- Random income for month ---
    monthly_income = round(random.uniform(15000, 30000), 2)
    earned = 0.0

    # Deposits: Add income until target met
    while earned < monthly_income:
        day = random.randint(1, 28)
        date = start_date.replace(day=day)
        date_str = date.strftime("%b %d")
        if date_str in used_dates:
            continue

        desc = random.choice(deposit_descs)()
        amount = round(random.uniform(500, min(5000, monthly_income - earned)), 2)
        earned += amount
        transactions.append((date_str, desc, type_map["Deposit"], f"{amount:,.2f}"))
        used_dates.add(date_str)

    # --- Expenses: Generate withdrawals that don’t push balance negative ---
    available_balance = starting_balance + earned
    spent = 0.0
    max_expense = available_balance * random.uniform(0.4, 0.7)  # Spend up to 70% of available balance

    for _ in range(random.randint(5, 485)):
        day = random.randint(1, 28)
        date = start_date.replace(day=day)
        date_str = date.strftime("%b %d")
        if date_str in used_dates:
            continue

        amount = round(random.uniform(50, 3000), 2)
        if spent + amount > max_expense:
            break  # Don't overspend

        desc = random.choice(withdrawal_descs)()
        typ = random.choice(["POS Withdrawal", "External Withdrawal"])
        transactions.append((date_str, desc, type_map[typ], f"-{amount:,.2f}"))
        spent += amount
        used_dates.add(date_str)

    # Sort chronologically
    transactions.sort(key=lambda t: datetime.strptime(t[0], "%b %d"))
    return transactions

def paginate_transactions(transactions):
    """
    Custom pagination logic:
    - First page: max 10 transactions
    - Middle pages: up to 25 transactions
    - Last page: up to 18 transactions to allow space for disclaimer
    Returns a list of pages, each page being a list of transactions
    """
    first_page_max = 10
    middle_page_max = 25
    last_page_max = 18

    if len(transactions) <= first_page_max:
        return [transactions]

    pages = []
    pages.append(transactions[:first_page_max])
    remaining = transactions[first_page_max:]

    while len(remaining) > last_page_max:
        pages.append(remaining[:middle_page_max])
        remaining = remaining[middle_page_max:]

    if remaining:
        pages.append(remaining)

    return pages

def calculate_balance_summary(transactions, starting_balance):
    income = 0.0
    expenses = 0.0

    for _, _, _, amt_str in transactions:
        # Remove $ and commas, convert to float
        amt = float(amt_str.replace("$", "").replace(",", ""))
        if amt >= 0:
            income += amt
        else:
            expenses += amt

    ending_balance = starting_balance + income + expenses

    def fmt(val):
        return f"$ {val:,.2f}" if val >= 0 else f"-$ {abs(val):,.2f}"

    return [
        ["Starting Balance", "Income", "Expenses", "Ending Balance"],
        [
            fmt(starting_balance),
            fmt(income),
            fmt(expenses),
            fmt(ending_balance),
        ],
    ]

def generate_novo_statement(output_path, logo_path, transactions, month, year, summary_table):
    width, height = LETTER
    c = canvas.Canvas(output_path, pagesize=LETTER)

    def draw_header_footer(width, is_last_page=False):
        c.setFont("Roboto-Regular", 6)
        c.setFillColor(HexColor("#CCCCCC"))
        c.drawString(40, 30, f"Page {c.getPageNumber()}")
        c.drawString(width / 2 - 40, 30, "Novo Platform Inc.")
        c.drawString(width - 95, 30, "(844) 260 - 6800")
        if is_last_page:
            disclaimer_style = ParagraphStyle(
                name="Disclaimer",
                fontName="Roboto-light",
                fontSize=9,
                leading=15,
                textColor=HexColor("#000000"),
            )

            disclaimer_text = (
                "Disclaimer: Novo utilizes temporary credits to facilitate your early receipt of payouts through "
                "the Novo Boost program. Starred transactions in this statement represent offsetting transactions "
                "that post upon the receipt of said payouts on their regularly scheduled date, and represent no "
                "material impact on your balance availability on said dates."
            )

            para = Paragraph(disclaimer_text, disclaimer_style)
            para_width = width - 80  # 40pt margins left and right
            para.wrapOn(c, para_width, 100)
            para.drawOn(c, 40, 40)
    
    height -= 25
    logo_path = "Novo_idpmMLw2CI_1.png"

    # Colors and fonts
    blue_color = HexColor("#2962FF")
    gray_border = HexColor("#CCCCCC")
    black = HexColor("#000000")

    def draw_first_page(height, width, _month, _year):
        # --- Logo (left aligned) ---
        c.drawImage(ImageReader(logo_path), 42, height - 150, width=200, preserveAspectRatio=True, mask='auto')

        # --- Title (right aligned) ---
        c.setFont("Roboto-Light", 16)
        c.setFillColor(black)
        c.drawRightString(width - 40, height - 65, "Monthly Account Statement")

        height -= 50
        # --- Bank Info ---
        c.setFont("Roboto-SemiCondensed-Bold", 10)
        c.drawString(40, height - 100, "Deposit account services provided by:")
        c.setFont("Roboto-Thin", 10)
        c.drawString(40, height - 115, "Middlesex Federal Savings, F.A., Member FDIC")
        c.drawString(40, height - 130, "1 College Avenue")
        c.drawString(40, height - 145, "Somerville, MA 02144")

        # --- Customer Info ---
        c.setFont("Roboto-SemiCondensed-Bold", 10)
        c.drawString(40, height - 180, "Customer Info")
        c.setFont("Roboto-Thin", 10)
        c.drawString(40, height - 195, "Zenith Health Ventures LLC  DBA HLTHi")
        c.drawString(40, height - 210, "Andres G. Valentin")
        c.drawString(40, height - 225, "685 W Lumsden Rd")
        c.drawString(40, height - 240, "Brandon, FL 33511")

        # --- Account Info (right) ---
        info_x = width - 175
        c.setFont("Roboto-SemiCondensed-Bold", 10)
        c.drawString(info_x, height - 100, "Account Number")
        c.setFont("Roboto-Thin", 10)
        c.drawString(info_x,height - 115, "XXXX 1850")
        c.setFont("Roboto-SemiCondensed-Bold", 10)
        c.drawString(info_x, height - 130, "Statement Date")
        c.setFont("Roboto-Thin", 10)
        c.drawString(info_x, height - 145, get_statement_date_range_string(_year, _month))

    # Colors
    blue = HexColor("#486FB2")
    green = HexColor("#5AAE57")
    red = HexColor("#CA364F")
    gray_border = HexColor("#CCCCCC")
    black = HexColor("#000000")

    # Clean values (no unicode space)
    data = summary_table

    # Column widths
    col_widths = [(width - 80) / 4] * 4
    table = Table(data, colWidths=col_widths)

    # Table style
    table.setStyle(TableStyle([
        # Font and alignment
        ("FONTNAME", (0, 0), (-1, 0), "Roboto-Medium"),   # Header
        ("FONTNAME", (0, 1), (-1, 1), "Roboto-Regular"),        # Values
        ("FONTSIZE", (0, 0), (-1, 0), 8),  # Header
        ("FONTSIZE", (0, 1), (-1, 1), 12),  # Value row
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),

        # Padding
        ("LEFTPADDING", (0, 0), (-1, 0), 15),   # Header
        ("LEFTPADDING", (0, 1), (-1, 1), 15),  # Value row: left padding for currency spacing
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 10),

        # Text colors (value row)
        ("TEXTCOLOR", (0, 0), (-1, 0), black),   # Header
        ("TEXTCOLOR", (0, 1), (0, 1), blue),     # Col 1
        ("TEXTCOLOR", (1, 1), (1, 1), green),    # Col 2
        ("TEXTCOLOR", (2, 1), (2, 1), red),      # Col 3
        ("TEXTCOLOR", (3, 1), (3, 1), blue),     # Col 4

        # Borders
        ("LINEABOVE", (0, 0), (-1, 0), 1, gray_border),   # Top border (header)
        ("LINEBELOW", (0, 1), (-1, 1), 1, gray_border),   # Bottom border (value row)

        # Right-side borders on inner columns only
        ("LINEAFTER", (0, 0), (0, 1), 1, gray_border),    # After Col 0
        ("LINEAFTER", (1, 0), (1, 1), 1, gray_border),    # After Col 1
        ("LINEAFTER", (2, 0), (2, 1), 1, gray_border),    # After Col 2
    ]))

    
    table.wrapOn(c, width, height)
    table.drawOn(c, 40, height - 400)
    height -= 30

    # Transaction style for wrapping
    type_style = ParagraphStyle(
        name='TransactionWrap',
        fontName='Roboto-Light',
        fontSize=9.5,
        leading=11,
        alignment=TA_LEFT,
    )

    # Amount style (right aligned)
    amount_style = ParagraphStyle(
        name='AmountRight',
        fontName='Roboto-Light',
        fontSize=9.5,
        alignment=TA_RIGHT,
    )

    pages = paginate_transactions(transactions)

    for i, page_data in enumerate(pages):

        is_first_page = i == 0
        is_last_page = i == len(pages) - 1

        if not is_first_page: 
            c.showPage()

        if i == 0:
            draw_first_page(height, width, month, year)

            f_height = height - 70
            # Table headers
            c.setFont("Roboto-Medium", 10)
            c.drawString(40, f_height - 340, "Date")
            c.drawString(100, f_height - 340, "Description")
            c.drawString(420, f_height - 340, "Type")
            c.drawString(width - 75, f_height - 340, "Amount")

        else:
            
            # Table headers
            c.setFont("Roboto-Medium", 10)
            c.drawString(40, height, "Date")
            c.drawString(100, height, "Description")
            c.drawString(420, height, "Type")
            c.drawString(width - 75, height, "Amount")


        table_data = []
        for date, desc, typ, amt in page_data:
            table_data.append([date, desc, Paragraph(typ, type_style), Paragraph(f"{amt}", amount_style)])

        col_widths = [60, 320, 96, 60] 
        tx_table = Table(table_data, colWidths=col_widths)
        tx_table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, -1), "Roboto-Light"),
            ("FONTSIZE", (0, 0), (-1, -1), 9.5),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-2, -1), 2),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
        ]))


        if i == 0: 
             # Measure table height
            w, h = tx_table.wrap(width, height)
            # Compute a safe Y start position (headers usually take ~50pts space)
            y_start = height - 420
            y_final = y_start

            # Draw the table
            tx_table.drawOn(c, 40, y_final - h)
        elif not is_last_page: 
            # Measure table height
            w, h = tx_table.wrap(width, height)
            # Compute a safe Y start position (headers usually take ~50pts space)
            y_start = height - 10 if not is_first_page else height - 665
            y_final = y_start

            # Draw the table
            tx_table.drawOn(c, 40, y_final - h)
        else:
             # Measure table height
            w, h = tx_table.wrap(width, height)
            # Compute a safe Y start position (headers usually take ~50pts space)
            y_start = height - 10 if not is_first_page else height - 665
            y_final = y_start

            # Draw the table
            tx_table.drawOn(c, 40, y_final - h)

        draw_header_footer(width, is_last_page=(i == len(pages) - 1))

    # # --- Transaction Header ---
    # c.setFont("Roboto-Medium", 10)
    # c.drawString(40, height - 340, "Date")
    # c.drawString(100, height - 340, "Description")
    # c.drawString(420, height - 340, "Type")
    # c.drawString(width - 75, height - 340, "Amount")

    # # Transaction style for wrapping
    # type_style = ParagraphStyle(
    #     name='TransactionWrap',
    #     fontName='Roboto-Light',
    #     fontSize=9.5,
    #     leading=11,
    #     alignment=TA_LEFT,
    # )

    # # Amount style (right aligned)
    # amount_style = ParagraphStyle(
    #     name='AmountRight',
    #     fontName='Roboto-Light',
    #     fontSize=9.5,
    #     alignment=TA_RIGHT,
    # )

    # transactions = generate_random_transactions(
    #     start_date=datetime(2025, 1, 1),
    #     end_date=datetime(2025, 12, 31),
    #     monthly_targets={
    #         f"2025-{str(m).zfill(2)}": random.randint(25000, 40000)
    #         for m in range(1, 13)
    #     }
    # )

    # # Format table rows
    # table_data = []
    # for date, desc, typ, amt in transactions:
    #     table_data.append([
    #         date,
    #         desc,
    #         Paragraph(typ, type_style),
    #         Paragraph(f"{amt}", amount_style)
    #     ])

    # # Define column widths
    # col_widths = [60, 320, 96, 60]  # aligns 3rd col at x=420 and right-aligns 4th col at x=572

    # # Create table
    # tx_table = Table(table_data, colWidths=col_widths)

    # # Style table
    # tx_table.setStyle(TableStyle([
    #     ("FONTNAME", (0, 0), (-1, -1), "Roboto-Light"),
    #     ("FONTSIZE", (0, 0), (-1, -1), 9.5),
    #     ("VALIGN", (0, 0), (-1, -1), "TOP"),
    #     ("LEFTPADDING", (0, 0), (-2, -1), 2),
    #     ("RIGHTPADDING", (0, 0), (-1, -1), 4),
    #     ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    #     ("TOPPADDING", (0, 0), (-1, -1), 3),
    # ]))

    # # Draw it
    # tx_table.wrapOn(c, width, height)
    # tx_table.drawOn(c, 40, height - 480)  # adjust vertical position as needed

    draw_header_footer(width, True)

    c.save()

def generate_statements_by_month(year_end_target, monthly_targets, logo_path, initital):
    for ym, target in monthly_targets.items():
        year, month = ym.split("-")
        start_date = datetime(int(year), int(month), 1)
        if int(month) == 12:
            end_date = datetime(int(year), 12, 31)
        else:
            end_date = datetime(int(year), int(month) + 1, 1) - timedelta(days=1)

        transactions = generate_random_transactions(start_date, end_date, {ym: target}, initital)
        output_path = f"Novo_Statement_{ym}.pdf"
        generate_novo_statement(output_path, logo_path, transactions)

months = ["03", "04", "05", "06"]
year = 2025
target = 350000

initial_amount = 56587.29 
statements = generate_random_transactions_for_months(months, year, target, initial_amount)
logo_path="Novo_idpmMLw2CI_1.png"
 # starting balance for first month

for ym in sorted(statements.keys()):  # ensure order: 04, 05, 06, 07
    transactions = statements[ym]
    output_path = f"Novo_Statement_{ym}.pdf"
    year, month = map(int, ym.split("-"))

    # Calculate summary for current month
    summary_table = calculate_balance_summary(transactions, initial_amount)
    ending_balance_str = summary_table[1][3]  # E.g. "$ 82,412.09"
    initial_amount = parse_currency(ending_balance_str)

    generate_novo_statement(output_path, logo_path, transactions, month, year, summary_table)
